import React, { useEffect, useState } from 'react';
import { Calendar, BookOpen, Clock, Award, FileText, CheckCircle } from 'lucide-react';

export const Academics = () => {
  const [role, setRole] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.roles?.includes('STUDENT')) setRole('STUDENT');
    else if (storedUser.roles?.includes('FACULTY')) setRole('FACULTY');

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [coursesRes, timetableRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/academics/courses', { headers }),
        fetch('http://localhost:3000/api/v1/academics/timetable', { headers })
      ]);

      const cData = await coursesRes.json();
      const tData = await timetableRes.json();

      if (cData.success) setCourses(cData.data);
      if (tData.success) setTimetable(tData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (examId: string, studentId: string, marks: number, maxMarks: number) => {
    if (marks > maxMarks) {
      alert(`Invalid grade! Marks cannot exceed the maximum score of ${maxMarks}.`);
      return;
    }
    if (marks < 0) {
      alert('Invalid grade! Marks cannot be negative.');
      return;
    }

    try {
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      };
      const response = await fetch(`http://localhost:3000/api/v1/academics/exams/${examId}/students/${studentId}/marks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ marksObtained: marks })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Grade saved successfully');
        fetchData(); // Refresh to show new grades
      } else {
        alert(`Failed to save grade: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the grade.');
    }
  };

  if (loading) return <div className="p-6">Loading academic portal...</div>;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Portal</h1>
          <p className="text-gray-500 mt-1">
            {role === 'STUDENT' ? 'View your classes, timetable, and results.' : 'Manage your assigned courses and grade exams.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Courses & Exams) */}
        <div className="lg:col-span-2 space-y-6">
          
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/> {role === 'STUDENT' ? 'My Enrolled Courses' : 'My Teaching Assignments'}
          </h2>

          {courses.length === 0 && <p className="text-gray-500">No courses found.</p>}

          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-50/50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                    <p className="text-sm font-medium text-blue-600 mt-1">{course.code} • {course.credits} Credits</p>
                  </div>
                  {role === 'FACULTY' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {course.enrollments?.length || 0} Students
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Assignments Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <FileText size={16} className="text-orange-500"/> Assignments
                    </h4>
                    {role === 'FACULTY' && (
                      <button onClick={() => {
                        const title = prompt('Assignment Title:');
                        const dueDate = prompt('Due Date (YYYY-MM-DD):');
                        const maxScoreStr = prompt('Max Score:');
                        if (title && dueDate && maxScoreStr) {
                          fetch(`http://localhost:3000/api/v1/academics/courses/${course.id}/assignments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ title, dueDate, maxScore: Number(maxScoreStr) })
                          }).then(() => fetchData());
                        }
                      }} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200">
                        + Add Assignment
                      </button>
                    )}
                  </div>
                  {course.assignments?.length > 0 ? (
                    <div className="space-y-2">
                      {course.assignments.map((a: any) => (
                        <div key={a.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{a.title}</p>
                            <p className="text-xs text-gray-500">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-500">Max: {a.maxScore}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-gray-500 italic">No assignments posted.</p>}
                </div>

                {/* Exams & Results Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Award size={16} className="text-purple-500"/> Exams & Results
                    </h4>
                    {role === 'FACULTY' && (
                      <button onClick={() => {
                        const name = prompt('Exam Name (e.g. Midterm):');
                        const date = prompt('Date (YYYY-MM-DD):');
                        const maxMarksStr = prompt('Max Marks:');
                        if (name && date && maxMarksStr) {
                          fetch(`http://localhost:3000/api/v1/academics/courses/${course.id}/exams`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ name, date, maxMarks: Number(maxMarksStr) })
                          }).then(() => fetchData());
                        }
                      }} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
                        + Schedule Exam
                      </button>
                    )}
                  </div>
                  {course.exams?.length > 0 ? (
                    <div className="space-y-4">
                      {course.exams.map((exam: any) => (
                        <div key={exam.id} className="p-4 border border-purple-100 bg-purple-50/30 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-purple-900">{exam.name}</p>
                            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">Max {exam.maxMarks}</span>
                          </div>

                          {role === 'STUDENT' && (
                            <div className="bg-white p-3 rounded border border-gray-100 flex justify-between items-center">
                              <span className="text-sm text-gray-600">Your Score</span>
                              {exam.results?.[0] ? (
                                <span className="font-bold text-lg text-green-600">{exam.results[0].marksObtained} <CheckCircle size={16} className="inline"/></span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Not graded yet</span>
                              )}
                            </div>
                          )}

                          {role === 'FACULTY' && (
                            <div className="mt-2 space-y-2">
                              {course.enrollments?.map((enrollment: any) => {
                                const result = exam.results?.find((r: any) => r.studentId === enrollment.studentId);
                                return (
                                  <div key={enrollment.studentId} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 text-sm">
                                    <span className="font-medium text-gray-700">{enrollment.student.firstName} {enrollment.student.lastName} ({enrollment.student.enrollmentNumber})</span>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        defaultValue={result?.marksObtained ?? ''}
                                        placeholder="Marks"
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                                        onBlur={(e) => {
                                          if(e.target.value !== '') {
                                            handleGradeSubmit(exam.id, enrollment.studentId, Number(e.target.value), exam.maxMarks);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-gray-500 italic">No exams scheduled.</p>}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Sidebar (Timetable) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500"/> Weekly Timetable
            </h2>
            
            {timetable.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No classes scheduled.</p>
            ) : (
              <div className="space-y-6">
                {days.map((dayName, idx) => {
                  const dayNum = idx + 1;
                  const classesToday = timetable.filter(t => t.dayOfWeek === dayNum).sort((a, b) => a.startTime.localeCompare(b.startTime));
                  
                  if (classesToday.length === 0) return null;

                  return (
                    <div key={dayNum}>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{dayName}</h3>
                      <div className="space-y-2">
                        {classesToday.map(t => (
                          <div key={t.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex flex-col items-center justify-center border-r border-gray-200 pr-3 min-w-[70px]">
                              <span className="text-sm font-bold text-gray-900">{t.startTime}</span>
                              <span className="text-xs text-gray-500">{t.endTime}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{t.course.code}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock size={12}/> {t.roomId}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

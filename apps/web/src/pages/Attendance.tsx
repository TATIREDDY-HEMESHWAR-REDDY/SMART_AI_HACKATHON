import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Users, ArrowLeft } from 'lucide-react';

export const Attendance = () => {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Faculty State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/attendance/courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setCourses(data.data);
    } catch (err) {
      console.error('Error fetching courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async (sessionId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/attendance/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        // Map existing record or default to PRESENT
        const initializedRoster = data.data.roster.map((r: any) => ({
          studentId: r.student.id,
          name: `${r.student.firstName} ${r.student.lastName}`,
          enrollment: r.student.enrollmentNumber,
          status: r.record?.status || 'PRESENT'
        }));
        setRoster(initializedRoster);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSessionClick = (course: any, session: any) => {
    setSelectedCourse(course);
    setSelectedSession(session);
    fetchRoster(session.id);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = roster.map(r => ({ studentId: r.studentId, status: r.status }));
      await fetch(`http://localhost:3000/api/v1/attendance/sessions/${selectedSession.id}/mark`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ records })
      });
      alert('Attendance saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = (studentId: string, status: string) => {
    setRoster(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const isFaculty = user?.roles?.includes('FACULTY');

  // --- FACULTY VIEW (MARK ATTENDANCE) ---
  if (isFaculty) {
    if (selectedSession) {
      return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
                <p className="text-sm text-gray-500">
                  {selectedCourse.name} - {new Date(selectedSession.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button 
              onClick={saveAttendance}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Enrollment No.</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roster.map(r => (
                  <tr key={r.studentId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.enrollment}</td>
                    <td className="px-6 py-4 text-gray-600">{r.name}</td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={r.status} 
                        onChange={(e) => updateStatus(r.studentId, e.target.value)}
                        className={`text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                          r.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Faculty Course List
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <p className="text-sm text-gray-500">Select a session to mark attendance</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Sessions</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {course.sessions?.map((session: any) => (
                    <button 
                      key={session.id}
                      onClick={() => handleSessionClick(course, session)}
                      className="min-w-[150px] p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900 text-sm">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-1">{session.topic || 'Regular Class'}</p>
                    </button>
                  ))}
                  {!course.sessions?.length && <p className="text-sm text-gray-500">No sessions scheduled.</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW (READ ONLY) ---
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Attendance</h2>
        <p className="text-sm text-gray-500">View your attendance across enrolled courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{course.name}</h3>
                <p className="text-sm text-gray-500">{course.code}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {course.sessions?.map((session: any) => (
                <div key={session.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{new Date(session.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{session.topic}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    Pending / Synced
                  </span>
                </div>
              ))}
              {!course.sessions?.length && (
                <div className="px-6 py-4 text-sm text-gray-500">No sessions recorded.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

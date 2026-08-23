'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, Code2, GraduationCap, LayoutDashboard, LogOut, Menu, Sparkles, Users, Trash2, CreditCard, ShieldAlert, Heart, Home as HomeIcon, User2 } from 'lucide-react';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type User = { id: number; username: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'WARDEN' | 'PARENT'; fullName: string; section?: string | null; mustResetPassword?: number };
type WeekSlot = { day: string; timeSlot: string; subject: string; classroom: string };
type Announcement = { id: number; title: string; message: string; authorName: string; authorRole: string; section: string | null; createdAt: string };
type Overview = { academics: { sgpa: number; cgpa: number; semester: number; creditsCompleted: number; creditsRemaining: number }; attendance: { subject: string; attended: number; total: number; trend: number; percentage: number }[]; insights: { category: string; status: string; title: string; detail: string; priority: string }[]; opportunities: { company: string; role: string; package: string; matchScore: number; deadline: string; gap: string }[]; marks: { subject: string; internal1: number; internal2: number; assignment: number; endSemMax: number; credit: number }[]; skills: { id: number; name: string; level: string; score: number }[]; profile: { phone: string; linkedin: string; github: string; portfolio: string; resumeName: string; targetRole: string; completion: number }; timetable: { timeSlot: string; subject: string; classroom: string }[]; weekTimetable?: WeekSlot[]; announcements?: Announcement[]; fees?: { type: 'HOSTEL' | 'TRANSPORT'; amount: number; paid: number; status: 'PAID' | 'PARTIAL' | 'PENDING'; details?: any } };

const nav = [
  ['Dashboard', LayoutDashboard],
  ['Attendance', CalendarDays],
  ['Exams & Marks', BookOpen],
  ['Calendar', CalendarDays],
  ['Fees', CreditCard],
  ['Hostel / Transport', HomeIcon],
  ['Safety Hub', ShieldAlert],
  ['Wellbeing', Heart],
  ['AI Insights', Sparkles],
  ['Career Portal', BriefcaseBusiness],
  ['My Profile', User2]
];
const percentage = (a: number, b: number) => Math.round((a / b) * 100);

function Login({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [username, setUsername] = useState('student'); const [password, setPassword] = useState('student'); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    console.log('Login submit triggered', { username, password });
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const text = await response.text();
      let result: any = null;
      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          result = { error: text };
        }
      }
      setLoading(false);
      if (!response.ok) return setError(result?.error || `Login failed (Status ${response.status})`);
      localStorage.setItem('campusos-user', JSON.stringify(result.user)); onSuccess(result.user);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error.');
    }
  }
  return <main className="login-shell"><section className="login-copy"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span className="eyebrow">AI-POWERED COLLEGE OPERATING SYSTEM</span><h1>Everything a student needs to move forward.</h1><p>Academics, career preparation and campus intelligence — brought together in one focused workspace.</p><div className="signal-card"><Sparkles size={19}/><div><b>Built around actionable intelligence</b><span>Understand signals, spot opportunities, then take the right next step.</span></div></div></section><section className="login-panel"><form onSubmit={submit}><div className="login-heading"><div className="mobile-brand"><div className="brand-mark">C</div>CampusOS</div><h2>Welcome back</h2><p>Sign in to your campus workspace.</p></div><label>Username<input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" /></label><label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter your password" autoComplete="current-password" /></label>{error && <div className="form-error">{error}</div>}<button type="submit" className="primary-button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <ChevronRight size={17}/></button><div className="demo-creds"><span>Demo access</span><button type="button" onClick={() => { setUsername('student'); setPassword('student'); }}>Student</button><button type="button" onClick={() => { setUsername('teacher.a1'); setPassword('teacher.a1'); }}>Teacher A1</button><button type="button" onClick={() => { setUsername('warden'); setPassword('warden'); }}>Warden</button><button type="button" onClick={() => { setUsername('admin'); setPassword('admin'); }}>Admin</button></div></form></section></main>;
}

function StudentDashboard({ user, data, logout, page, setPage, updateData }: { user: User; data: Overview; logout: () => void; page: string; setPage: (page: string) => void; updateData: (next: Overview) => void }) {
  const overall = Math.round(data.attendance.reduce((sum, item) => sum + item.attended, 0) * 100 / data.attendance.reduce((sum, item) => sum + item.total, 0));
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
  return <main className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><div className="workspace-label">STUDENT WORKSPACE</div><nav>{nav.map(([label, Icon]) => <button onClick={() => setPage(label as string)} className={page === label ? 'nav-item active' : 'nav-item'} key={label as string}><Icon size={18}/>{label as string}{label === 'AI Insights' && <span className="new-dot">3</span>}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={() => setPage('Notifications')}><Bell size={18}/>Notifications<span className="new-dot">{(data.announcements ?? []).length}</span></button><button className="profile-button" onClick={() => setPage('My Profile')}><span className="avatar">{initials}</span><span><b>{user.fullName}</b><small>Student · CSE · Section {user.section || '—'}</small></span></button></div></aside><section className="content"><header className="topbar"><button className="icon-button"><Menu size={20}/></button><div className="breadcrumbs">Student workspace <ChevronRight size={15}/> <b>{page}</b></div><div className="top-actions"><button className="icon-button" onClick={() => setPage('Notifications')}><Bell size={19}/><i/></button><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></div></header><div className="page">{page === 'Dashboard' ? <><div className="welcome"><div><span className="eyebrow">{todayLabel}</span><h1>Good morning, {user.fullName.split(' ')[0]}</h1><p>Here is the signal from your academic and career journey today.</p></div><button className="outline-button" onClick={() => setPage('Calendar')}><CalendarDays size={17}/> View calendar</button></div>
  <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}><span style={{background:'#eef4ff',color:'#2868cc',padding:'4px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'bold'}}>{'Section '}{user.section || '—'}</span><span style={{background:'#f0fdf4',color:'#16a34a',padding:'4px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'bold'}}>{'Semester '}{data.academics.semester}</span><span style={{background:'#faf5ff',color:'#7c3aed',padding:'4px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'bold'}}>{'CGPA '}{data.academics.cgpa}</span></div>
  <TimetableWidget today={data.timetable} week={data.weekTimetable} />
  <AnnouncementsFeed announcements={data.announcements} /><section className="metric-grid" style={{ gridTemplateColumns: '1fr' }}><article className="metric-card"><span>Overall attendance</span><strong className={overall < 75 ? 'warning-text' : ''}>{overall}%</strong><small className="warning-text">1 subject needs attention</small></article></section><section className="two-column" style={{ gridTemplateColumns: '1fr' }}><article className="card"><div className="card-heading"><div><span className="eyebrow">ATTENDANCE</span><h2>Keep your buffer healthy</h2></div><button onClick={() => setPage('Attendance')}>Details <ChevronRight size={16}/></button></div><div className="attendance-list">{data.attendance.map(subject => <div className="attendance-row" key={subject.subject}><div><b>{subject.subject}</b><small>{subject.attended} of {subject.total} classes</small></div><div className="attendance-number"><b className={subject.percentage < 75 ? 'warning-text' : ''}>{subject.percentage}%</b><span className={subject.trend < 0 ? 'down' : 'up'}>{subject.trend > 0 ? '↑' : '↓'} {Math.abs(subject.trend)}%</span></div></div>)}</div></article></section></> : page === 'Attendance' ? <AttendancePage data={data} /> : page === 'Exams & Marks' ? <MarksPage data={data} setPage={setPage} /> : page === 'Calendar' ? <CalendarPage user={user} /> : page === 'Fees' ? <FeesPage user={user} data={data} updateData={updateData} /> : page === 'Hostel / Transport' ? <HostelTransportPage user={user} data={data} /> : page === 'Safety Hub' ? <SafetyHubPage user={user} /> : page === 'Wellbeing' ? <WellbeingPage user={user} /> : page === 'AI Insights' ? <AIInsightsPage /> : page === 'My Profile' ? <ProfilePage user={user} data={data} setPage={setPage} /> : page === 'Career Portal' ? <CareerPortalPage user={user} data={data} /> : page === 'Notifications' ? <NotificationsPage announcements={data.announcements} /> : <ComingSoon title={page} />}</div></section></main>;
}

function SectionHeader({ label, title, text }: { label: string; title: string; text: string }) { return <div className="section-header"><span className="eyebrow blue">{label}</span><h1>{title}</h1><p>{text}</p></div>; }
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
function TimetableWidget({ today, week }: { today: { timeSlot: string; subject: string; classroom: string }[]; week?: WeekSlot[] }) {
  const [expanded, setExpanded] = useState(false);
  const slots = Array.from(new Set((week ?? []).map(r => r.timeSlot))).sort();
  const cell = (day: string, slot: string) => (week ?? []).find(r => r.day === day && r.timeSlot === slot);

  return (
    <section className="timetable-section" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Today's Timetable</h2>
        {week && week.length > 0 && (
          <button className="outline-button" onClick={() => setExpanded(true)} style={{ padding: '8px 14px', fontSize: '13px' }}><CalendarDays size={15}/> View full week</button>
        )}
      </div>
      {(!today || today.length === 0) ? (
        <div className="card" style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No classes scheduled for today.</div>
      ) : (
        <div className="timetable-strip">
          {today.map((slot, index) => (
            <article className="timetable-slot-card" key={slot.timeSlot + index}>
              <span className="timetable-slot-time">{slot.timeSlot}</span>
              <strong className="timetable-slot-subject">{slot.subject}</strong>
              <span className="timetable-slot-room">{slot.classroom}</span>
            </article>
          ))}
        </div>
      )}
      {expanded && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={() => setExpanded(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '920px', maxHeight: '86vh', overflow: 'auto', border: '1px solid #e4eaf2', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Weekly Timetable</h2>
              <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="timetable-grid">
                <thead>
                  <tr>
                    <th>Time</th>
                    {WEEK_DAYS.map(day => <th key={day}>{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot}>
                      <td className="timetable-grid-time">{slot}</td>
                      {WEEK_DAYS.map(day => {
                        const entry = cell(day, slot);
                        return (
                          <td key={day}>
                            {entry ? <div className="timetable-grid-cell"><b>{entry.subject}</b><span>{entry.classroom}</span></div> : <span className="timetable-grid-empty">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
function AnnouncementsFeed({ announcements }: { announcements?: Announcement[] }) {
  return (
    <section className="pulse">
      <div className="pulse-head">
        <div><span className="eyebrow blue"><Bell size={14}/> ANNOUNCEMENTS</span><h2>Latest updates</h2><p>Posted by teachers and administration.</p></div>
      </div>
      {(!announcements || announcements.length === 0) ? (
        <div className="card" style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No announcements yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {announcements.map(item => (
            <article className="card" key={item.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge good">{item.section ? `Section ${item.section}` : 'Campus-wide'}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>{item.title}</strong>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>{item.message}</p>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', display: 'block' }}>{item.authorName} · {item.authorRole === 'ADMIN' ? 'Administration' : 'Faculty'}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function AttendancePage({ data }: { data: Overview }) {
  const overall = Math.round(data.attendance.reduce((sum, row) => sum + row.attended, 0) * 100 / data.attendance.reduce((sum, row) => sum + row.total, 0));
  const pie = data.attendance.map((row, index) => ({ name: row.subject.replace(' Management', ''), value: row.percentage, color: ['#f59e0b','#2563eb','#14b8a6','#8b5cf6'][index] }));
  return <><SectionHeader label="ATTENDANCE" title="Your attendance, subject by subject" text="See where your attendance stands and protect your academic eligibility."/><TimetableWidget today={data.timetable} week={data.weekTimetable} /><div className="module-grid"><article className="card donut-card"><div><span className="eyebrow">OVERALL ATTENDANCE</span><h2>{overall}%</h2><p className="warning-text">Operating Systems needs attention</p></div><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={[{ value: overall }, { value: 100 - overall }]} dataKey="value" innerRadius={65} outerRadius={85} startAngle={90} endAngle={-270} stroke="none"><Cell fill="#2563eb"/><Cell fill="#e9eef6"/></Pie><Tooltip/></PieChart></ResponsiveContainer></article><article className="card"><div className="card-heading"><div><span className="eyebrow">SUBJECT-WISE ATTENDANCE</span><h2>Attendance distribution</h2></div></div><div className="legend-list">{pie.map(row => <div key={row.name}><i style={{ background: row.color }}/><span>{row.name}</span><b>{row.value}%</b></div>)}</div></article></div><article className="card table-card"><div className="card-heading"><div><span className="eyebrow">CLASS RECORD</span><h2>Subject attendance</h2><p>A minimum of 75% is required for each subject.</p></div></div><div className="data-table"><div className="table-head"><span>Subject</span><span>Classes attended</span><span>Percentage</span><span>Trend</span><span>Status</span></div>{data.attendance.map(row => <div className="table-row" key={row.subject}><b>{row.subject}</b><span>{row.attended} / {row.total}</span><b className={row.percentage < 75 ? 'warning-text' : ''}>{row.percentage}%</b><span className={row.trend < 0 ? 'warning-text' : 'positive-text'}>{row.trend > 0 ? '↑' : '↓'} {Math.abs(row.trend)} pts</span><span className={row.percentage < 75 ? 'badge warning' : 'badge good'}>{row.percentage < 75 ? 'At risk' : 'Healthy'}</span></div>)}</div></article></>;
}
function gradeFromTotal(total: number) { if (total >= 91) return 'O'; if (total >= 81) return 'A+'; if (total >= 71) return 'A'; if (total >= 61) return 'B+'; if (total >= 51) return 'B'; if (total >= 41) return 'C+'; if (total >= 35) return 'C'; if (total >= 30) return 'E'; return 'F'; }
function MarksPage({ data, setPage }: { data: Overview; setPage: (page: string) => void }) {
  const [selected, setSelected] = useState(data.marks[0].subject); const [target, setTarget] = useState('A'); const mark = data.marks.find(row => row.subject === selected)!; const current = Math.round((mark.internal1 + mark.internal2) / 2 + mark.assignment); const targetFloor: Record<string, number> = { O: 91, 'A+': 81, A: 71, 'B+': 61, B: 51, 'C+': 41, C: 35, E: 30, F: 0 }; const needed = Math.max(0, targetFloor[target] - current); const internalChart = data.marks.map(row => ({ subject: row.subject.split(' ')[0], internal1: row.internal1, internal2: row.internal2 }));
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(d => {
        const exams = (d.events ?? []).filter((e: any) => e.type === 'EXAM');
        setUpcomingExams(exams);
      });
  }, []);

  return <><SectionHeader label="EXAMS & MARKS" title="Assessments and grade planning" text="Internal marks are tracked separately. Use the calculator to set a realistic end-semester target."/>
  
  <article className="card" style={{ marginBottom: '24px' }}>
    <div className="card-heading">
      <div>
        <span className="eyebrow">ACADEMIC CALENDAR</span>
        <h2>Upcoming Examinations (Click to view calendar)</h2>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', padding: '24px' }}>
      {upcomingExams.length === 0 ? <p>No upcoming exams scheduled.</p> : upcomingExams.map(exam => (
        <div key={exam.id} onClick={() => setPage('Calendar')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}>
          <div>
            <strong style={{ display: 'block', color: '#0f172a' }}>{exam.title}</strong>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{exam.description || 'No details'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 'bold', color: '#2563eb', display: 'block' }}>{exam.date}</span>
            {exam.section && <span className="badge warning" style={{ fontSize: '10px', marginTop: '4px' }}>Sec {exam.section}</span>}
          </div>
        </div>
      ))}
    </div>
  </article>

  <div className="module-grid"><article className="card chart-card"><div className="card-heading"><div><span className="eyebrow">INTERNAL ASSESSMENTS</span><h2>Internal marks trend</h2><p>Each internal is out of 20 marks.</p></div></div><ResponsiveContainer width="100%" height={250}><LineChart data={internalChart}><XAxis dataKey="subject" tickLine={false} axisLine={false}/><YAxis domain={[0,20]} tickLine={false} axisLine={false}/><Tooltip/><Line type="monotone" dataKey="internal1" stroke="#2563eb" strokeWidth={3} dot={{r:4}} name="Internal 1"/><Line type="monotone" dataKey="internal2" stroke="#14b8a6" strokeWidth={3} dot={{r:4}} name="Internal 2"/></LineChart></ResponsiveContainer></article><article className="card calculator"><span className="eyebrow">GRADE PLANNER</span><h2>What do you need in end-sem?</h2><label>Subject<select value={selected} onChange={e => setSelected(e.target.value)}>{data.marks.map(row => <option key={row.subject}>{row.subject}</option>)}</select></label><label>Target grade<select value={target} onChange={e => setTarget(e.target.value)}>{Object.keys(targetFloor).map(grade => <option key={grade}>{grade}</option>)}</select></label><div className="grade-result"><span>Current secured marks</span><b>{current} / 40</b><strong>{needed > mark.endSemMax ? 'Not mathematically possible' : `${needed} / ${mark.endSemMax}`}</strong><p>{needed > mark.endSemMax ? `Even a perfect end-sem gives ${gradeFromTotal(current + mark.endSemMax)}.` : `Score at least ${needed} in the end-semester exam to earn ${target}.`}</p></div></article></div><article className="card table-card"><div className="card-heading"><div><span className="eyebrow">MARKS REGISTER</span><h2>Semester 4 assessment breakdown</h2></div></div><div className="data-table marks-table"><div className="table-head"><span>Subject</span><span>Internal 1</span><span>Internal 2</span><span>Assignment</span><span>Secured / 40</span><span>Current grade</span></div>{data.marks.map(row => { const total = Math.round((row.internal1 + row.internal2) / 2 + row.assignment); return <div className="table-row" key={row.subject}><b>{row.subject}</b><span>{row.internal1}/20</span><span>{row.internal2}/20</span><span>{row.assignment}/10</span><b>{total}/40</b><span className="badge good">On track for {gradeFromTotal(total + 42)}</span></div>})}</div></article><p className="grade-scale">Grade scale: <b>O</b> 91–100 · <b>A+</b> 81–90 · <b>A</b> 71–80 · <b>B+</b> 61–70 · <b>B</b> 51–60 · <b>C+</b> 41–50 · <b>C</b> 35–40 · <b>E</b> 30–34 · <b>F</b> below 30</p></>;
}

function CalendarPage({ user }: { user: User }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', type: 'HOLIDAY', date: '', description: '', section: '' });
  const [msg, setMsg] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadEvents = () => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadEvents(); }, []);

  async function createEvent(e: FormEvent) {
    e.preventDefault(); setMsg('');
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg('Event added successfully!');
      setForm({ title: '', type: 'HOLIDAY', date: '', description: '', section: '' });
      loadEvents();
    } else {
      const err = await res.json();
      setMsg(err.error || 'Failed to create event.');
    }
  }

  async function deleteEvent(id: number) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const res = await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadEvents();
  }

  const eventsByDate = new Map<string, any[]>();
  events.forEach(ev => {
    const key = ev.date?.split('T')[0];
    if (key) eventsByDate.set(key, [...(eventsByDate.get(key) ?? []), ev]);
  });

  function renderMonth(year: number, month: number) {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = first.getDay();
    const monthName = first.toLocaleString('default', { month: 'long' });
    const cells: (number | null)[] = Array(startDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div key={`${year}-${month}`} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e4eaf2', padding: '16px', minWidth: 0 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px', textAlign: 'center' }}>{monthName} {year}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', fontSize: '12px', textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} style={{ fontWeight: 'bold', color: '#94a3b8', padding: '4px 0' }}>{d}</span>)}
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsByDate.get(dateStr);
            const today = new Date();
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            return (
              <span key={i} title={dayEvents?.map(e => `${e.type}: ${e.title}`).join('\n') ?? ''} onClick={() => setSelectedDate(dateStr)} style={{
                padding: '4px 0', borderRadius: '6px', cursor: 'pointer', position: 'relative',
                background: selectedDate === dateStr ? '#1e40af' : isToday ? '#2868cc' : dayEvents ? (dayEvents.some((e: any) => e.type === 'EXAM') ? '#fef2f2' : '#f0fdf4') : 'transparent',
                color: selectedDate === dateStr ? '#fff' : isToday ? '#fff' : dayEvents ? (dayEvents.some((e: any) => e.type === 'EXAM') ? '#dc2626' : '#16a34a') : '#334155',
                fontWeight: dayEvents || isToday || selectedDate === dateStr ? 'bold' : 'normal',
                outline: selectedDate === dateStr ? '2px solid #2868cc' : 'none', outlineOffset: '1px'
              }}>
                {day}
                {dayEvents && <span style={{ position: 'absolute', bottom: '1px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: dayEvents.some((e: any) => e.type === 'EXAM') ? '#dc2626' : '#16a34a' }} />}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSixMonths() {
    const today = new Date();
    const months: { year: number; month: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {months.map(m => renderMonth(m.year, m.month))}
      </div>
    );
  }

  return (
    <><SectionHeader label="ACADEMIC CALENDAR" title="Schedule and Events" text="Keep track of upcoming college holidays, examinations, and major section events."/>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <button className={showCalendar ? 'primary-button' : 'outline-button'} onClick={() => setShowCalendar(!showCalendar)} style={{ padding: '8px 16px', fontSize: '14px' }}>
          <CalendarDays size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{showCalendar ? 'Hide calendar' : '6 Month View'}
        </button>
        {showCalendar && (
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Holiday</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} /> Exam</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2868cc', display: 'inline-block' }} /> Today</span>
          </div>
        )}
      </div>
      {showCalendar && renderSixMonths()}
      {selectedDate && (
        <article className="card" style={{ marginBottom: '24px', border: '1px solid #2868cc' }}>
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span className="eyebrow blue">SELECTED DATE</span><h2>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2></div>
            <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>{'×'}</button>
          </div>
          <div style={{ padding: '20px' }}>
            {eventsByDate.get(selectedDate)?.length ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {eventsByDate.get(selectedDate)!.map((ev: any) => (
                  <div key={ev.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: ev.type === 'EXAM' ? '#fef2f2' : '#f0fdf4', padding: '16px', borderRadius: '12px', border: `1px solid ${ev.type === 'EXAM' ? '#fecaca' : '#bbf7d0'}` }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ev.type === 'EXAM' ? '#dc2626' : '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>{ev.type}</div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>{ev.title}</strong>
                      {ev.description && <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0' }}>{ev.description}</p>}
                      {ev.section && <span style={{ fontSize: '11px', color: '#b45309', background: '#fffbeb', padding: '2px 6px', borderRadius: '6px', marginTop: '6px', display: 'inline-block' }}>Section {ev.section}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '12px 0' }}>No events scheduled for this date.</p>
            )}
          </div>
        </article>
      )}
      <div className="module-grid" style={{ gridTemplateColumns: user.role === 'ADMIN' ? '1.5fr 1fr' : '1fr', gap: '24px' }}>
        <article className="card">
          <div className="card-heading"><div><span className="eyebrow">EVENTS</span><h2>Upcoming dates ({events.length})</h2></div></div>
          {loading ? <p style={{ padding: '24px' }}>Loading calendar events...</p> : (
            <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
              {events.length === 0 ? <p>No events scheduled.</p> : events.map(event => (
                <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e4eaf2' }}>
                  <div>
                    <span className={`badge ${event.type === 'HOLIDAY' ? 'good' : 'warning'}`} style={{ marginRight: '8px' }}>{event.type}</span>
                    {event.section && <span style={{ fontSize: '11px', background: '#fffbeb', color: '#b45309', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>Sec {event.section}</span>}
                    <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginTop: '6px' }}>{event.title}</strong>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{event.description}</span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <strong style={{ color: '#2868cc', fontSize: '15px' }}>{event.date}</strong>
                    {user.role === 'ADMIN' && (
                      <button onClick={() => deleteEvent(event.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
        {user.role === 'ADMIN' && (
          <article className="card">
            <span className="eyebrow">ADMIN CONTROL</span>
            <h2>Create New Event</h2>
            <form className="admin-form" onSubmit={createEvent} style={{ marginTop: '16px' }}>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" required />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="HOLIDAY">HOLIDAY</option>
                <option value="EXAM">EXAM</option>
              </select>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dce4ef', width: '100%', minHeight: '80px' }} />
              <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="Section restriction (e.g. A1, optional)" />
              <button className="primary-button" style={{ marginTop: '10px' }}>Add Event</button>
            </form>
            {msg && <p className="form-message" style={{ marginTop: '10px' }}>{msg}</p>}
          </article>
        )}
      </div>
    </>
  );
}

function FeesPage({ user, data, updateData }: { user: User; data: Overview; updateData: (next: Overview) => void }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function submitPayment(e: FormEvent) {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const resData = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg(`Payment of ₹${amount} simulated successfully!`);
        setAmount('');
        updateData({ ...data, fees: resData.fees });
      } else {
        setMsg(resData.error || 'Payment failed.');
      }
    } catch {
      setLoading(false); setMsg('Error processing payment.');
    }
  }

  const fees = data.fees;
  if (!fees) return <p style={{ padding: '24px' }}>No fee record found for your account.</p>;
  const remaining = fees.amount - fees.paid;

  return (
    <><SectionHeader label="FINANCE" title="Hostel & Transport Fees" text="Manage your campus dining, accommodation, and transportation balances." />
      <div className="module-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <article className="card">
          <div className="card-heading"><div><span className="eyebrow">CONTRACT DETAILS</span><h2>{fees.type} ACCOUNT SUMMARY</h2></div></div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div><span style={{ fontSize: '12px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Service Type</span><strong style={{ fontSize: '18px', color: '#0f172a' }}>{fees.type === 'HOSTEL' ? 'Campus Hostel Residence' : 'Route Transport Bus'}</strong></div>
            <div><span style={{ fontSize: '12px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Account Status</span><span className={`badge ${fees.status === 'PAID' ? 'good' : 'warning'}`} style={{ fontSize: '13px', fontWeight: 'bold' }}>{fees.status}</span></div>
            <div><span style={{ fontSize: '12px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Total Amount</span><strong style={{ fontSize: '20px', color: '#0f172a' }}>₹{fees.amount.toLocaleString()}</strong></div>
            <div><span style={{ fontSize: '12px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Total Paid</span><strong style={{ fontSize: '20px', color: '#10b981' }}>₹{fees.paid.toLocaleString()}</strong></div>
            <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e4eaf2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Remaining Balance</span><strong style={{ display: 'block', fontSize: '22px', color: remaining > 0 ? '#ef4444' : '#10b981' }}>₹{remaining.toLocaleString()}</strong></div>
              <div style={{ width: '40%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${(fees.paid / fees.amount) * 100}%`, height: '100%', background: '#10b981' }} /></div>
            </div>
            {fees.details && (
              <div style={{ gridColumn: 'span 2', background: '#f1f5f9', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Service Allocation Details</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  {fees.type === 'HOSTEL' ? (
                    <>
                      <div><span style={{ color: '#64748b' }}>Block Name:</span> <strong style={{ display: 'block' }}>{fees.details.blockName}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Room Number:</span> <strong style={{ display: 'block' }}>{fees.details.roomNo}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Warden Name:</span> <strong style={{ display: 'block' }}>{fees.details.wardenName}</strong></div>
                    </>
                  ) : (
                    <>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Pickup/Drop Location:</span> <strong style={{ display: 'block' }}>{fees.details.location}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Pickup Time:</span> <strong style={{ display: 'block' }}>{fees.details.pickupTime}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Drop Time:</span> <strong style={{ display: 'block' }}>{fees.details.dropTime}</strong></div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>
        <article className="card">
          <span className="eyebrow">ONLINE GATEWAY</span><h2>Simulate Fee Payment</h2><p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>Submit a test transaction to reduce your remaining balance.</p>
          <form className="admin-form" onSubmit={submitPayment}>
            <input type="number" min="1" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (INR)" required disabled={remaining === 0} />
            <button className="primary-button" disabled={loading || remaining === 0}>{loading ? 'Processing...' : remaining === 0 ? 'Fully Paid' : 'Submit Simulation Payment'}</button>
          </form>
          {msg && <p className="form-message" style={{ marginTop: '12px' }}>{msg}</p>}
        </article>
      </div>
    </>
  );
}

function SafetyHubPage({ user }: { user: User }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportForm, setReportForm] = useState({ type: 'SECURITY', title: '', description: '' });
  const [reportMsg, setReportMsg] = useState('');
  const [visitorForm, setVisitorForm] = useState({ name: '', purpose: '', hostName: '' });
  const [visitorMsg, setVisitorMsg] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastAlert, setBroadcastAlert] = useState('');

  const loadData = () => {
    fetch('/api/safety')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setIncidents(d.incidents ?? []); setVisitors(d.visitors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  async function triggerPanicAlert(panicType: string) {
    const title = panicType === 'WOMEN' ? "WOMEN'S SAFETY PANIC ALERT" : "EMERGENCY PANIC TRIGGER";
    const description = panicType === 'WOMEN' ? `Women's safety distress button clicked. Current user: ${user.fullName}. Requesting immediate responder dispatch.` : `Emergency medical/security panic triggered by ${user.fullName}.`;
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'EMERGENCY', title, description })
    });
    if (res.ok) {
      alert(`${panicType === 'WOMEN' ? "Women's Safety Escort Alert" : "Emergency Security Panic"} has been broadcast to security responders! Help is on the way.`);
      loadData();
    }
  }

  async function submitReport(e: FormEvent) {
    e.preventDefault(); setReportMsg('');
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportForm)
    });
    if (res.ok) {
      setReportMsg('Incident reported to campus dispatch team.');
      setReportForm({ type: 'SECURITY', title: '', description: '' });
      loadData();
    } else {
      setReportMsg('Failed to submit incident report.');
    }
  }

  async function checkinVisitor(e: FormEvent) {
    e.preventDefault(); setVisitorMsg('');
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...visitorForm, action: 'CHECK_IN' })
    });
    if (res.ok) {
      setVisitorMsg('Visitor check-in logged.');
      setVisitorForm({ name: '', purpose: '', hostName: '' });
      loadData();
    } else {
      setVisitorMsg('Check-in failed.');
    }
  }

  async function checkoutVisitor(id: number) {
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'CHECK_OUT' })
    });
    if (res.ok) loadData();
  }

  async function resolveIncident(id: number) {
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'RESOLVE_INCIDENT' })
    });
    if (res.ok) loadData();
  }

  async function sendBroadcast(e: FormEvent) {
    e.preventDefault(); setBroadcastAlert('');
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'BROADCAST', message: broadcastMsg })
    });
    if (res.ok) {
      setBroadcastAlert('Emergency notification broadcasted successfully.');
      setBroadcastMsg('');
      loadData();
    }
  }

  return (
    <><SectionHeader label="SECURITY & OPERATIONS" title="Campus Safety Hub" text="Integrated systems for women's safety alerts, emergency broadcasts, visitor logs, and incident management." />
      {user.role === 'STUDENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <button onClick={() => triggerPanicAlert('WOMEN')} style={{ background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c', padding: '20px', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)' }}>Trigger Women's Safety Panic Alert</button>
          <button onClick={() => triggerPanicAlert('EMERGENCY')} style={{ background: '#fffbeb', border: '2px solid #d97706', color: '#92400e', padding: '20px', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1)' }}>Emergency Medical / Security Trigger</button>
        </div>
      )}
      <div className="module-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <article className="card">
            <div className="card-heading"><div><span className="eyebrow">SECURITY MONITORING</span><h2>Active Safety & Dispatch Logs ({incidents.length})</h2></div></div>
            {loading ? <p style={{ padding: '24px' }}>Loading incident logs...</p> : (
              <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
                {incidents.length === 0 ? <p>No safety logs or reports.</p> : incidents.map(inc => (
                  <div key={inc.id} style={{ borderLeft: `4px solid ${inc.type === 'EMERGENCY' ? '#ef4444' : '#3b82f6'}`, background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span className={`badge ${inc.type === 'EMERGENCY' ? 'warning' : 'info'}`} style={{ marginRight: '6px' }}>{inc.type}</span><span className={`badge ${inc.status === 'RESOLVED' ? 'good' : 'warning'}`}>{inc.status}</span></div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a', marginTop: '8px' }}>{inc.title}</strong>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '6px 0 10px' }}>{inc.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                      <span>Reported by: <strong>{inc.studentName || 'Self'}</strong> {inc.section && `· Sec ${inc.section}`}</span>
                      {inc.status === 'OPEN' && (user.role === 'ADMIN' || user.role === 'TEACHER') && (
                        <button onClick={() => resolveIncident(inc.id)} style={{ color: '#10b981', border: '1px solid #10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Resolve Dispatch</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
          {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
            <article className="card">
              <div className="card-heading"><div><span className="eyebrow">VISITOR MANAGEMENT</span><h2>Visitor Access Logs ({visitors.length})</h2></div></div>
              <div style={{ padding: '24px' }} className="data-table">
                <div className="table-head" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.8fr' }}><span>Visitor</span><span>Purpose</span><span>Host</span><span>Checked In</span><span style={{ textAlign: 'right' }}>Actions</span></div>
                {visitors.length === 0 ? <p style={{ marginTop: '12px' }}>No active visitor logs.</p> : visitors.map(vis => (
                  <div className="table-row" key={vis.id} style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.8fr', fontSize: '13px' }}>
                    <b>{vis.name}</b><span>{vis.purpose}</span><span>{vis.hostName}</span><span>{new Date(vis.inTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {vis.status === 'ACTIVE' ? <button onClick={() => checkoutVisitor(vis.id)} style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Check out</button> : <span style={{ color: '#64748b', fontSize: '11px' }}>Out: {new Date(vis.outTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {user.role === 'STUDENT' && (
            <article className="card">
              <span className="eyebrow">SAFETY INCIDENT REPORTING</span><h2>Report a Hazard / Safety Issue</h2>
              <form className="admin-form" onSubmit={submitReport} style={{ marginTop: '16px' }}>
                <label>Issue Type
                  <select value={reportForm.type} onChange={e => setReportForm({ ...reportForm, type: e.target.value })}>
                    <option value="SECURITY">General Security / Suspicious Activity</option>
                    <option value="INCIDENT">Campus Hazard / Injury / Spill</option>
                    <option value="WOMEN_SAFETY">Women's Safety Escort / Concern</option>
                  </select>
                </label>
                <input value={reportForm.title} onChange={e => setReportForm({ ...reportForm, title: e.target.value })} placeholder="Brief title" required />
                <textarea value={reportForm.description} onChange={e => setReportForm({ ...reportForm, description: e.target.value })} placeholder="Details of location..." required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dce4ef', width: '100%', minHeight: '80px' }} />
                <button className="primary-button">Submit Dispatch Alert</button>
              </form>
              {reportMsg && <p className="form-message" style={{ marginTop: '12px' }}>{reportMsg}</p>}
            </article>
          )}
          {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
            <article className="card">
              <span className="eyebrow">RECEPTION CHECK-IN</span><h2>Log Visitor Entry</h2>
              <form className="admin-form" onSubmit={checkinVisitor} style={{ marginTop: '16px' }}>
                <input value={visitorForm.name} onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })} placeholder="Visitor full name" required />
                <input value={visitorForm.purpose} onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })} placeholder="Purpose of visit" required />
                <input value={visitorForm.hostName} onChange={e => setVisitorForm({ ...visitorForm, hostName: e.target.value })} placeholder="Host name" required />
                <button className="primary-button">Check-in Visitor</button>
              </form>
              {visitorMsg && <p className="form-message" style={{ marginTop: '12px' }}>{visitorMsg}</p>}
            </article>
          )}
          {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
            <article className="card" style={{ border: '1px solid #fca5a5', background: '#fff5f5' }}>
              <span className="eyebrow" style={{ color: '#dc2626' }}>EMERGENCY BROADCASTS</span><h2>Campus Emergency Alert</h2><p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 16px' }}>Send notification signals across all active student screens.</p>
              <form className="admin-form" onSubmit={sendBroadcast}>
                <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Type emergency message here..." required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', width: '100%', minHeight: '80px', background: '#fff' }} />
                <button className="primary-button" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>Broadcast Alert Signal</button>
              </form>
              {broadcastAlert && <p className="form-message" style={{ marginTop: '12px', color: '#10b981' }}>{broadcastAlert}</p>}
            </article>
          )}
        </div>
      </div>
    </>
  );
}

function WellbeingPage({ user }: { user: User }) {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodScore, setMoodScore] = useState(4);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  const loadData = () => {
    fetch('/api/wellbeing')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setCheckins(d.checkins ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  async function submitCheckin(e: FormEvent) {
    e.preventDefault(); setMsg('');
    const res = await fetch('/api/wellbeing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moodScore, notes })
    });
    if (res.ok) {
      setMsg('Wellbeing check-in saved! Thank you.');
      setNotes(''); setMoodScore(4); loadData();
    } else {
      setMsg('Failed to log wellbeing.');
    }
  }

  const avgMood = checkins.length > 0 ? (checkins.reduce((s, c) => s + c.moodScore, 0) / checkins.length).toFixed(1) : 'N/A';
  const moodEmojis: Record<number, string> = { 1: 'Sad / Stressed', 2: 'Anxious / Tired', 3: 'Neutral / OK', 4: 'Good / Focused', 5: 'Great / Energetic' };

  return (
    <><SectionHeader label="WELLNESS" title="Student Wellbeing Tracker" text="Keep track of mental fitness, record mood check-ins, and highlight distress signals for faculty guidance." />
      <div className="module-grid" style={{ gridTemplateColumns: user.role === 'STUDENT' ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {user.role === 'STUDENT' && (
          <article className="card">
            <span className="eyebrow">DAILY CHECK-IN</span><h2>How are you feeling today?</h2>
            <form className="admin-form" onSubmit={submitCheckin} style={{ marginTop: '16px' }}>
              <label>Current Mood: <strong style={{ color: '#2868cc' }}>{moodEmojis[moodScore]}</strong>
                <input type="range" min="1" max="5" value={moodScore} onChange={e => setMoodScore(Number(e.target.value))} style={{ width: '100%', height: '36px', cursor: 'pointer' }} />
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything on your mind?..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dce4ef', width: '100%', minHeight: '100px' }} />
              <button className="primary-button">Submit Wellbeing Check-in</button>
            </form>
            {msg && <p className="form-message" style={{ marginTop: '12px' }}>{msg}</p>}
          </article>
        )}
        <article className="card">
          <div className="card-heading"><div><span className="eyebrow">{user.role === 'STUDENT' ? 'YOUR TREND' : 'FACULTY GUIDANCE MONITOR'}</span><h2>{user.role === 'STUDENT' ? 'Personal Wellbeing History' : `Section Wellbeing Grid (Class Mood: ${avgMood}/5)`}</h2></div></div>
          {loading ? <p style={{ padding: '24px' }}>Loading check-in history...</p> : (
            <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
              {checkins.length === 0 ? <p>No wellbeing check-ins logged.</p> : checkins.map(chk => {
                const isFlagged = chk.moodScore <= 2;
                return (
                  <div key={chk.id} style={{ borderLeft: `4px solid ${isFlagged ? '#ef4444' : '#10b981'}`, background: isFlagged ? '#fffbeb' : '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>Mood: {chk.moodScore}/5 ({moodEmojis[chk.moodScore]?.split(' ')[0]})</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(chk.createdAt).toLocaleDateString()}</span>
                    </div>
                    {chk.notes && <p style={{ fontSize: '13px', color: '#475569', margin: '6px 0 10px', fontStyle: 'italic' }}>"{chk.notes}"</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                      <span>Student: <strong>{chk.studentName || 'Self'}</strong></span>
                      {isFlagged && <span style={{ color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>Flagged concern</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </>
  );
}

function NotificationsPage({ announcements }: { announcements?: Announcement[] }) {
  return (
    <>
      <SectionHeader label="NOTIFICATIONS" title="Your Notifications" text="Announcements and updates from teachers and administration." />
      <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
        {(!announcements || announcements.length === 0) ? (
          <div className="card" style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>No notifications right now. Check back later.</div>
        ) : announcements.map(item => (
          <article className="card" key={item.id} style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Bell size={16} style={{ color: '#2868cc' }} />
                <span className="badge good">{item.section ? `Section ${item.section}` : 'Campus-wide'}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginBottom: '6px' }}>{item.title}</strong>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{item.message}</p>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', display: 'block' }}>{item.authorName} · {item.authorRole === 'ADMIN' ? 'Administration' : 'Faculty'}</span>
          </article>
        ))}
      </div>
    </>
  );
}

function ProfilePage({ user, data, setPage }: { user: User; data: Overview; setPage: (p: string) => void }) {
  const [profile, setProfile] = useState(data.profile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: profile?.phone || '', linkedin: profile?.linkedin || '', github: profile?.github || '', portfolio: profile?.portfolio || '', targetRole: profile?.targetRole || '' });
  const [msg, setMsg] = useState('');

  async function saveProfile(e: FormEvent) {
    e.preventDefault(); setMsg('');
    const res = await fetch('/api/student/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      setMsg('Profile updated successfully.');
    } else {
      setMsg('Failed to update profile.');
    }
  }

  const overall = Math.round(data.attendance.reduce((s, r) => s + r.attended, 0) * 100 / data.attendance.reduce((s, r) => s + r.total, 0));

  return (
    <>
      <SectionHeader label="MY PROFILE" title={user.fullName} text="Your academic identity and personal information." />
      <div className="module-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <article className="card">
          <div className="card-heading"><div><span className="eyebrow">ACADEMIC IDENTITY</span><h2>Student Information</h2></div></div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Full Name</span><strong style={{ fontSize: '16px', color: '#0f172a' }}>{user.fullName}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Username</span><strong style={{ fontSize: '16px', color: '#0f172a' }}>{user.username}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Section</span><strong style={{ fontSize: '16px', color: '#2868cc' }}>{user.section || '—'}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Semester</span><strong style={{ fontSize: '16px', color: '#0f172a' }}>{data.academics.semester}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>CGPA</span><strong style={{ fontSize: '20px', color: '#2868cc' }}>{data.academics.cgpa}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>SGPA</span><strong style={{ fontSize: '20px', color: '#0f172a' }}>{data.academics.sgpa}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Credits Completed</span><strong style={{ fontSize: '16px' }}>{data.academics.creditsCompleted} / {data.academics.creditsCompleted + data.academics.creditsRemaining}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Overall Attendance</span><strong style={{ fontSize: '20px', color: overall < 75 ? '#ef4444' : '#10b981' }}>{overall}%</strong></div>
          </div>
        </article>

        <article className="card">
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span className="eyebrow">PERSONAL DETAILS</span><h2>Contact & Career</h2></div>
            <button className="outline-button" onClick={() => setEditing(!editing)} style={{ padding: '6px 14px', fontSize: '13px' }}>{editing ? 'Cancel' : 'Edit'}</button>
          </div>
          {editing ? (
            <form className="admin-form" onSubmit={saveProfile} style={{ padding: '24px' }}>
              <label>Phone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" /></label>
              <label>LinkedIn<input value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="LinkedIn URL" /></label>
              <label>GitHub<input value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="GitHub URL" /></label>
              <label>Portfolio<input value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="Portfolio URL" /></label>
              <label>Target Role<input value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} placeholder="e.g. Software Engineer" /></label>
              <button className="primary-button" style={{ marginTop: '8px' }}>Save Profile</button>
            </form>
          ) : (
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Phone</span><strong style={{ fontSize: '15px' }}>{profile?.phone || 'Not set'}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Target Role</span><strong style={{ fontSize: '15px' }}>{profile?.targetRole || 'Not set'}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>LinkedIn</span><strong style={{ fontSize: '14px', wordBreak: 'break-all' }}>{profile?.linkedin || 'Not set'}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>GitHub</span><strong style={{ fontSize: '14px', wordBreak: 'break-all' }}>{profile?.github || 'Not set'}</strong></div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Portfolio</span><strong style={{ fontSize: '14px', wordBreak: 'break-all' }}>{profile?.portfolio || 'Not set'}</strong></div>
              <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e4eaf2' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Profile Completion</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${profile?.completion || 0}%`, height: '100%', background: '#2868cc' }} /></div>
                  <strong style={{ color: '#2868cc' }}>{profile?.completion || 0}%</strong>
                </div>
              </div>
            </div>
          )}
          {msg && <p className="form-message" style={{ padding: '0 24px 16px' }}>{msg}</p>}
        </article>
      </div>

      <div className="two-column" style={{ marginTop: '24px' }}>
        <article className="card">
          <div className="card-heading"><div><span className="eyebrow">SKILLS</span><h2>Your skill inventory ({data.skills.length})</h2></div></div>
          <div style={{ display: 'grid', gap: '10px', padding: '24px' }}>
            {data.skills.map(skill => (
              <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e4eaf2' }}>
                <div><strong style={{ fontSize: '14px', color: '#0f172a' }}>{skill.name}</strong><span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>{skill.level}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${skill.score}%`, height: '100%', background: skill.score >= 80 ? '#10b981' : skill.score >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{skill.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="card">
          <div className="card-heading"><div><span className="eyebrow">CAREER PIPELINE</span><h2>Tracked opportunities ({data.opportunities.length})</h2></div></div>
          <div style={{ display: 'grid', gap: '10px', padding: '24px' }}>
            {data.opportunities.map(opp => (
              <div key={opp.company} style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e4eaf2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: '14px', color: '#0f172a' }}>{opp.company}</strong><span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{opp.role} · {opp.package}</span></div>
                  <span className={opp.matchScore >= 80 ? 'badge good' : 'badge warning'}>{opp.matchScore}% match</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  <span>Deadline: {opp.deadline}</span>
                  {opp.gap && <span style={{ color: '#f59e0b' }}>Gap: {opp.gap}</span>}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

function ComingSoon({ title }: { title: string }) { return <div className="coming-soon"><Sparkles size={28}/><span className="eyebrow">STUDENT WORKSPACE</span><h1>{title}</h1><p>This module is next in the CampusOS build. Your existing data model is already designed to connect here.</p></div>; }

const CAREER_OS_URL = process.env.NEXT_PUBLIC_CAREER_OS_URL || 'http://localhost:5173';

function CareerPortalPage({ user, data }: { user: User; data: Overview }) {
  // Encode the full ERP student profile so Career OS has real seed data.
  // erp_data = base64(JSON) containing skills, profile fields, opportunities.
  // Unicode-safe base64: encodeURIComponent handles non-Latin1 chars before btoa
  const erpPayload = btoa(encodeURIComponent(JSON.stringify({
    skills: data.skills,
    targetRole: data.profile?.targetRole ?? '',
    github: data.profile?.github ?? '',
    linkedin: data.profile?.linkedin ?? '',
    opportunities: data.opportunities,
  })));

  // student_id matches the Career OS seed: STU{userId:05d}
  const studentId = `STU${String(user.id).padStart(5, '0')}`;

  const params = new URLSearchParams({
    erp_session: '1',
    student_id: studentId,
    name: user.fullName,
    section: user.section || '',
    cgpa: String(data.academics.cgpa),
    semester: String(data.academics.semester),
    erp_data: erpPayload,
  });
  const careerUrl = `${CAREER_OS_URL}/career?${params.toString()}`;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="eyebrow blue"><BriefcaseBusiness size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> PLACEMENT PREP</span>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>Career OS</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Assessments, coding practice, resume builder, AI mock interviews and job tracking — all in one place.</p>
        </div>
        <a href={careerUrl} target="_blank" rel="noopener noreferrer" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <ArrowUpRight size={16} /> Open in new tab
        </a>
      </div>
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e4eaf2', height: 'calc(100vh - 200px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <iframe
          src={careerUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Career OS"
          allow="clipboard-write"
        />
      </div>
    </>
  );
}
function AIInsightsPage() {
  const [insights, setInsights] = useState<{ category: string; status: string; title: string; detail: string; priority: string }[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState('');

  function load() {
    setLoading(true); setError('');
    fetch('/api/student/ai-insights')
      .then(async r => { const body = await r.json(); if (!r.ok) throw new Error(body.error || 'Failed to generate insights.'); return body; })
      .then(body => { setInsights(body.insights); setGeneratedAt(body.generatedAt); setError(''); })
      .catch(err => setError(insights ? 'Regeneration failed — showing previous results.' : err.message))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <SectionHeader label="AI INTELLIGENCE" title="Your personal AI insights" text="Generated live from your attendance, marks, skills and career data." />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '10px', alignItems: 'center' }}>
        {generatedAt && !loading && <span style={{ fontSize: '12px', color: '#64748b' }}>Generated {new Date(generatedAt).toLocaleTimeString()}</span>}
        <button className="outline-button" onClick={load} disabled={loading}><Sparkles size={16}/> {loading ? 'Thinking...' : 'Regenerate'}</button>
      </div>
      {error && <div style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', background: insights ? '#fffbeb' : '#fef2f2', color: insights ? '#92400e' : '#dc2626', border: `1px solid ${insights ? '#fde68a' : '#fecaca'}` }}>{error}</div>}
      {loading && !insights ? (
        <p style={{ color: '#64748b' }}>Analyzing your academic and career data...</p>
      ) : (
        <div className="pulse-grid">
          {(insights ?? []).map((insight, index) => (
            <article className={`pulse-item ${insight.priority}`} key={index}>
              <div className="pulse-icon">{insight.priority === 'warning' ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}</div>
              <div>
                <div className="item-top"><span>{insight.category}</span><b>{insight.status}</b></div>
                <h3>{insight.title}</h3>
                <p>{insight.detail}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function TeacherWorkspace({ user, logout }: { user: User; logout: () => void }) {
  const [selectedSection, setSelectedSection] = useState<string>(user.section || 'A1');
  const [result, setResult] = useState<{ 
    section: string; 
    students: { id: number; fullName: string; username: string | null; registerNo: string; email: string | null; section: string; cgpa: number | null; attendance: number; department: string | null }[]; 
    aggregate: { averageCgpa: number; averageAttendance: number; studentCount: number };
    isClassTeacher: boolean;
    timetable?: { timeSlot: string; subject: string; classroom: string }[];
    weekTimetable?: WeekSlot[];
    announcements?: Announcement[];
  } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', scope: 'OWN' });
  const [announcementMsg, setAnnouncementMsg] = useState('');

  async function postAnnouncement(e: FormEvent) {
    e.preventDefault(); setAnnouncementMsg('');
    const section = announcementForm.scope === 'ALL' ? 'ALL' : selectedSection;
    const response = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: announcementForm.title, message: announcementForm.message, section }) });
    const result = await response.json();
    if (!response.ok) return setAnnouncementMsg(result.error || 'Failed to post announcement.');
    setAnnouncementForm({ title: '', message: '', scope: 'OWN' });
    setAnnouncementMsg('Announcement posted.');
    loadDashboard(selectedSection);
  }
  async function deleteAnnouncement(id: number) {
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    loadDashboard(selectedSection);
  }

  const [safetyData, setSafetyData] = useState<{ incidents: any[]; visitors: any[] }>({ incidents: [], visitors: [] });
  const [wellbeingData, setWellbeingData] = useState<{ checkins: any[] }>({ checkins: [] });

  const loadSafetyAndWellbeing = () => {
    fetch('/api/safety').then(r => r.json()).then(setSafetyData);
    fetch('/api/wellbeing').then(r => r.json()).then(setWellbeingData);
  };

  const loadDashboard = (sect: string) => {
    fetch(`/api/teacher/dashboard?section=${sect}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setResult)
      .catch(() => setResult(null));
  };

  useEffect(() => { loadDashboard(selectedSection); }, [selectedSection]);

  useEffect(() => {
    if (result && result.isClassTeacher) {
      loadSafetyAndWellbeing();
    }
  }, [result]);

  const updateAttendance = async (studentId: number, currentAttendance: number, delta: number) => {
    const newAttendance = Math.min(100, Math.max(0, currentAttendance + delta));
    try {
      const response = await fetch('/api/teacher/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, attendance: newAttendance })
      });
      if (response.ok) {
        loadDashboard(selectedSection);
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent((prev: any) => prev ? { ...prev, attendance: newAttendance } : null);
        }
      } else {
        const res = await response.json();
        alert(res.error || 'Failed to update attendance.');
      }
    } catch {
      alert('Error updating attendance.');
    }
  };
  return <main className="erp-shell"><header className="erp-top"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span>Faculty ERP</span><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="erp-page"><SectionHeader label={`TEACHER · HOME SECTION ${user.section}`} title={`Faculty Dashboard`} text="Manage attendance and view student profiles across section classrooms."/><div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: '#fff', padding: '8px', borderRadius: '12px', border: '1px solid #e4eaf2', width: 'fit-content' }}>{['A1', 'B1', 'C1'].map(sect => (<button key={sect} onClick={() => setSelectedSection(sect)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', background: selectedSection === sect ? '#2868cc' : 'none', color: selectedSection === sect ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>Section {sect} {user.section === sect && <span style={{ fontSize: '11px', background: '#eef4ff', color: '#2868cc', padding: '2px 6px', borderRadius: '6px' }}>Home</span>}</button>))}</div>{!result ? <p>Loading classroom list…</p> : <>
        {result.timetable && <TimetableWidget today={result.timetable} week={result.weekTimetable} />}
        <div className="placement-summary"><article><span>Selected Classroom</span><strong>Section {result.section}</strong><p>{result.isClassTeacher ? 'You are the Class Teacher (Full Access)' : 'Subject Teacher (Attendance Only)'}</p></article><article><span>Students</span><strong>{result.aggregate.studentCount}</strong><p>Enrolled in classroom.</p></article><article><span>Class Attendance</span><strong>{result.aggregate.averageAttendance}%</strong><p>Class CGPA: {result.isClassTeacher ? result.aggregate.averageCgpa : 'Restricted'}</p></article></div>
        <div className="two-column" style={{ marginBottom: '24px' }}>
          <article className="card">
            <div className="card-heading"><div><span className="eyebrow">ANNOUNCEMENTS</span><h2>Post an update</h2></div></div>
            <form className="admin-form" onSubmit={postAnnouncement} style={{ marginTop: '16px' }}>
              <input value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Announcement title" required/>
              <textarea value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} placeholder="Message for students" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dce4ef', width: '100%', minHeight: '90px' }}/>
              <select value={announcementForm.scope} onChange={e => setAnnouncementForm({ ...announcementForm, scope: e.target.value })}>
                <option value="OWN">Section {selectedSection} only</option>
                <option value="ALL">Campus-wide</option>
              </select>
              <button className="primary-button">Post announcement</button>
            </form>
            {announcementMsg && <p className="form-message" style={{ marginTop: '12px' }}>{announcementMsg}</p>}
          </article>
          <article className="card">
            <div className="card-heading"><div><span className="eyebrow">RECENT</span><h2>Your posted updates</h2></div></div>
            <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
              {!result.announcements || result.announcements.length === 0 ? <p style={{ color: '#64748b' }}>No announcements posted yet.</p> : result.announcements.map(item => (
                <div key={item.id} style={{ borderLeft: '4px solid #2868cc', background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge good">{item.section ? `Section ${item.section}` : 'Campus-wide'}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <strong style={{ display: 'block', fontSize: '14px', marginTop: '8px' }}>{item.title}</strong>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 8px' }}>{item.message}</p>
                  {item.authorName === user.fullName && <button onClick={() => deleteAnnouncement(item.id)} style={{ color: '#ef4444', border: '1px solid #ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Delete</button>}
                </div>
              ))}
            </div>
          </article>
        </div>
        <article className="card table-card"><div className="card-heading"><div><span className="eyebrow">STUDENT ROSTER</span><h2>Section {result.section}</h2><p>{result.isClassTeacher ? 'Click any row to open full student details.' : 'Click details is restricted. Mark attendance directly below.'}</p></div></div><div className="data-table teacher-table"><div className="table-head" style={{ gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 1.5fr' }}><span>Student</span><span>Register number</span><span>Section</span><span>Attendance</span><span style={{ textAlign: 'right', paddingRight: '20px' }}>Mark Attendance</span></div>{result.students.map(student => (<div className="table-row" key={student.id} onClick={() => { if (result.isClassTeacher) { setSelectedStudent(student); } }} style={{ gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 1.5fr', cursor: result.isClassTeacher ? 'pointer' : 'default', transition: 'background 0.2s' }} onMouseEnter={(e) => { if (result.isClassTeacher) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { if (result.isClassTeacher) e.currentTarget.style.background = 'none'; }}><b>{student.fullName}</b><span>{student.registerNo}</span><span className="badge good" style={{ width: 'fit-content', background: '#eef4ff', color: '#2868cc', fontSize: '11px', fontWeight: 'bold' }}>{student.section}</span><span className={student.attendance < 75 ? 'badge warning' : 'badge good'}>{student.attendance}%</span><div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%', paddingRight: '12px' }} onClick={(e) => e.stopPropagation()}><button onClick={() => updateAttendance(student.id, student.attendance, -1)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Absent (-1%)</button><button onClick={() => updateAttendance(student.id, student.attendance, 1)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #10b981', background: '#ecfdf5', color: '#10b981', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Present (+1%)</button></div></div>))}</div></article>
        {result.isClassTeacher && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <article className="card">
              <div className="card-heading"><div><span className="eyebrow">SAFETY & DISPATCH</span><h2>Class Safety Incident Logs ({safetyData.incidents.length})</h2></div></div>
              <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
                {safetyData.incidents.length === 0 ? <p>No safety logs reported.</p> : safetyData.incidents.map((inc: any) => (
                  <div key={inc.id} style={{ borderLeft: `4px solid ${inc.type === 'EMERGENCY' ? '#ef4444' : '#3b82f6'}`, background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span className={`badge ${inc.type === 'EMERGENCY' ? 'warning' : 'info'}`} style={{ marginRight: '6px' }}>{inc.type}</span><span className={`badge ${inc.status === 'RESOLVED' ? 'good' : 'warning'}`}>{inc.status}</span></div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginTop: '8px' }}>{inc.title}</strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 8px' }}>{inc.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                      <span>Student: <strong>{inc.studentName}</strong></span>
                      {inc.status === 'OPEN' && (
                        <button onClick={async () => {
                          await fetch('/api/safety', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: inc.id, action: 'RESOLVE_INCIDENT' }) });
                          loadSafetyAndWellbeing();
                        }} style={{ color: '#10b981', border: '1px solid #10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Resolve</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="card">
              <div className="card-heading"><div><span className="eyebrow">STUDENT WELLNESS</span><h2>Wellness check-in history ({wellbeingData.checkins.length})</h2></div></div>
              <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
                {wellbeingData.checkins.length === 0 ? <p>No check-ins logged.</p> : wellbeingData.checkins.map((chk: any) => {
                  const isFlagged = chk.moodScore <= 2;
                  return (
                    <div key={chk.id} style={{ borderLeft: `4px solid ${isFlagged ? '#ef4444' : '#10b981'}`, background: isFlagged ? '#fffbeb' : '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>Mood: {chk.moodScore}/5</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(chk.createdAt).toLocaleDateString()}</span>
                      </div>
                      {chk.notes && <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 8px', fontStyle: 'italic' }}>"{chk.notes}"</p>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                        <span>Student: <strong>{chk.studentName}</strong></span>
                        {isFlagged && <span style={{ color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '2px 6px', borderRadius: '6px' }}>Flagged concern</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        )}
        {selectedStudent && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedStudent(null)}><div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '540px', border: '1px solid #e4eaf2', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', margin: 'auto' }} onClick={(e) => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Student Profile Details</h2><button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>×</button></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0' }}><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Full Name</span><strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedStudent.fullName}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Register Number</span><strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedStudent.registerNo}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Username</span><strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedStudent.username || 'N/A'}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Email</span><strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedStudent.email || 'N/A'}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Department</span><strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedStudent.department || 'N/A'}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Section</span><strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedStudent.section}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>CGPA</span><strong style={{ fontSize: '18px', color: '#2868cc' }}>{selectedStudent.cgpa !== null ? selectedStudent.cgpa : 'Restricted'}</strong></div><div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Attendance</span><strong style={{ fontSize: '18px', color: selectedStudent.attendance < 75 ? '#ef4444' : '#10b981' }}>{selectedStudent.attendance}%</strong></div><div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px' }}><span style={{ fontSize: '10px', color: '#475569', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Service Allocation Detail</span><strong style={{ fontSize: '13px', color: '#0f172a', fontWeight: 'normal' }}>{selectedStudent.allocationDetails || 'None Assigned'}</strong></div></div><div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}><button onClick={() => setSelectedStudent(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #dce4ef', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Close Details</button></div></div></div>)}</>}</div></main>;
}
function LegacyAdminWorkspace({ user, logout }: { user: User; logout: () => void }) {
  const [students, setStudents] = useState<{ id: number; fullName: string; username: string; registerNo: string; department: string; section: string; cgpa: number; attendance: number }[]>([]); const [message, setMessage] = useState(''); const [form, setForm] = useState({ fullName:'', username:'', password:'', registerNo:'', section:'A1', department:'Computer Science', cgpa:'0', attendance:'0' });
  const load = () => fetch('/api/admin/students').then(r => r.json()).then(r => setStudents(r.students ?? [])); useEffect(() => { void load(); }, []);
  async function createStudent(event: FormEvent) { event.preventDefault(); setMessage(''); const response = await fetch('/api/admin/students', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }); const result = await response.json(); if (!response.ok) return setMessage(result.error); setMessage(`${result.fullName} can now sign in with the username and password you created.`); setForm({ fullName:'', username:'', password:'', registerNo:'', section:'A1', department:'Computer Science', cgpa:'0', attendance:'0' }); load(); }
  return <main className="erp-shell"><header className="erp-top"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span>Administrator ERP</span><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="erp-page"><SectionHeader label="ADMINISTRATION" title={`Welcome, ${user.fullName}`} text="Create and manage student accounts. New students cannot log in until an administrator creates their account."/><div className="module-grid admin-grid"><article className="card"><span className="eyebrow">CREATE STUDENT ACCOUNT</span><h2>Enroll a student</h2><p className="form-copy">Their username and password become active immediately after creation.</p><form className="admin-form" onSubmit={createStudent}><input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Student full name" required/><div><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Login username" required/><input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Temporary password" required/></div><input value={form.registerNo} onChange={e=>setForm({...form,registerNo:e.target.value})} placeholder="Register number" required/><div><select value={form.section} onChange={e=>setForm({...form,section:e.target.value})}><option>A1</option><option>B1</option><option>C1</option></select><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Department" required/></div><div><input type="number" min="0" max="10" step="0.1" value={form.cgpa} onChange={e=>setForm({...form,cgpa:e.target.value})} placeholder="CGPA"/><input type="number" min="0" max="100" value={form.attendance} onChange={e=>setForm({...form,attendance:e.target.value})} placeholder="Attendance %"/></div><button className="primary-button">Create student login</button></form>{message && <p className="form-message">{message}</p>}</article><article className="card"><span className="eyebrow">FACULTY ACCESS</span><h2>Section assignments</h2><div className="teacher-access"><div><b>Dr. Priya Nair</b><span>Section A1 · <code>teacher.a1</code></span></div><div><b>Dr. Arjun Menon</b><span>Section B1 · <code>teacher.b1</code></span></div><div><b>Dr. Kavya Iyer</b><span>Section C1 · <code>teacher.c1</code></span></div></div><p className="access-note">Each teacher login is locked to its section. Student records from other sections are rejected by the ERP API.</p></article></div><article className="card table-card"><div className="card-heading"><div><span className="eyebrow">STUDENT DIRECTORY</span><h2>{students.length} administrator-created accounts</h2></div></div><div className="data-table admin-table"><div className="table-head"><span>Student</span><span>Username</span><span>Register no.</span><span>Section</span><span>CGPA</span><span>Attendance</span></div>{students.map(student => <div className="table-row" key={student.id}><b>{student.fullName}</b><span>{student.username}</span><span>{student.registerNo}</span><span className="badge good">{student.section}</span><span>{student.cgpa}</span><span>{student.attendance}%</span></div>)}</div></article></div></main>;
}
function AdminWorkspace({ user, logout }: { user: User; logout: () => void }) {
  const [accountType, setAccountType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [students, setStudents] = useState<{ id: number; fullName: string; username: string; registerNo: string; email: string; section: string; cgpa: number; attendance: number; parentUserId: number | null }[]>([]);
  const [teachers, setTeachers] = useState<{ id: number; fullName: string; username: string; email: string; section: string }[]>([]);
  const [parents, setParents] = useState<{ id: number; fullName: string; username: string; email: string; childName: string | null }[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ fullName: '', username: '', password: '', email: '', registerNo: '', section: 'A1', department: 'Computer Science', cgpa: '0', attendance: '0' });
  const [createParent, setCreateParent] = useState(false);
  const [parentForm, setParentForm] = useState({ parentFullName: '', parentUsername: '', parentPassword: '', parentEmail: '' });
  const [viewingStudentId, setViewingStudentId] = useState<number | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', section: 'ALL' });
  const [announcementMsg, setAnnouncementMsg] = useState('');

  const load = () => fetch('/api/admin/students').then(response => response.json()).then(result => {
    setStudents(result.students ?? []);
    setTeachers(result.teachers ?? []);
    setParents(result.parents ?? []);
  });
  const loadAnnouncements = () => fetch('/api/announcements').then(r => r.json()).then(r => setAnnouncements(r.announcements ?? []));
  useEffect(() => { void load(); void loadAnnouncements(); }, []);

  async function createAccount(event: FormEvent) {
    event.preventDefault(); setMessage('');
    const payload = { ...form, accountType, createParent: accountType === 'STUDENT' && createParent, ...parentForm };
    const response = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error);
    const parentNote = result.parent ? (result.parent.mail?.sent ? ` Parent account created and email sent to ${result.parent.email}.` : ` Parent account created.`) : '';
    setMessage((result.mail?.sent ? `Account created and onboarding email sent to ${result.email}.` : `Account created. ${result.mail?.reason}`) + parentNote);
    setForm({ fullName: '', username: '', password: '', email: '', registerNo: '', section: 'A1', department: 'Computer Science', cgpa: '0', attendance: '0' });
    setParentForm({ parentFullName: '', parentUsername: '', parentPassword: '', parentEmail: '' });
    setCreateParent(false);
    void load();
  }
  async function deleteAccount(userId: number) {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      const response = await fetch(`/api/admin/students?id=${userId}`, { method: 'DELETE' });
      const text = await response.text();
      let result: any = null;
      if (text) {
        try { result = JSON.parse(text); } catch { result = { error: text }; }
      }
      if (!response.ok) return alert(result?.error || 'Failed to delete account.');
      if (viewingStudentId === userId) setViewingStudentId(null);
      load();
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting.');
    }
  }
  async function postAnnouncement(e: FormEvent) {
    e.preventDefault(); setAnnouncementMsg('');
    const response = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(announcementForm) });
    const result = await response.json();
    if (!response.ok) return setAnnouncementMsg(result.error || 'Failed to post announcement.');
    setAnnouncementForm({ title: '', message: '', section: 'ALL' });
    setAnnouncementMsg('Announcement posted.');
    loadAnnouncements();
  }
  async function deleteAnnouncement(id: number) {
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    loadAnnouncements();
  }
  if (viewingStudentId !== null) {
    return <StudentDetailPage studentId={viewingStudentId} onBack={() => setViewingStudentId(null)} onDelete={deleteAccount} logout={logout} />;
  }
  return <main className="erp-shell"><header className="erp-top"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span>Administrator ERP</span><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="erp-page">
    <SectionHeader label="ADMINISTRATION" title={`Welcome, ${user.fullName}`} text="Only administrators create student, teacher and parent login accounts."/>

    <article className="card table-card"><div className="card-heading"><div><span className="eyebrow">STUDENT DIRECTORY</span><h2>{students.length} student accounts</h2><p className="form-copy">Click any student to view their full profile.</p></div></div><div className="data-table admin-table"><div className="table-head" style={{ gridTemplateColumns: '1.4fr 1.1fr 1.1fr .7fr .5fr .7fr 0.8fr' }}><span>Student</span><span>Email</span><span>Register no.</span><span>Section</span><span>CGPA</span><span>Attendance</span><span>Actions</span></div>{students.map(student => <div className="table-row" key={student.id} onClick={() => setViewingStudentId(student.id)} style={{ gridTemplateColumns: '1.4fr 1.1fr 1.1fr .7fr .5fr .7fr 0.8fr', cursor: 'pointer' }}><b>{student.fullName}</b><span>{student.email}</span><span>{student.registerNo}</span><span className="badge good">{student.section}</span><span>{student.cgpa}</span><span>{student.attendance}%</span><button className="delete-button" onClick={(e) => { e.stopPropagation(); deleteAccount(student.id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><Trash2 size={15}/> Delete</button></div>)}</div></article>

    <article className="card table-card" style={{ marginTop: '24px' }}><div className="card-heading"><div><span className="eyebrow">TEACHER DIRECTORY</span><h2>{teachers.length} teacher accounts</h2></div></div><div className="data-table admin-table"><div className="table-head" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}><span>Teacher</span><span>Email</span><span>Section</span><span>Actions</span></div>{teachers.map(teacher => <div className="table-row" key={teacher.id} style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}><b>{teacher.fullName}</b><span>{teacher.email}</span><span className="badge good">{teacher.section}</span><button className="delete-button" onClick={() => deleteAccount(teacher.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><Trash2 size={15}/> Delete</button></div>)}</div></article>

    <article className="card table-card" style={{ marginTop: '24px' }}><div className="card-heading"><div><span className="eyebrow">PARENT DIRECTORY</span><h2>{parents.length} parent accounts</h2></div></div><div className="data-table admin-table"><div className="table-head" style={{ gridTemplateColumns: '2fr 2fr 2fr 1fr' }}><span>Parent</span><span>Email</span><span>Child</span><span>Actions</span></div>{parents.length === 0 ? <p style={{ padding: '20px', color: '#64748b' }}>No parent accounts yet. Enroll one below alongside a student.</p> : parents.map(parent => <div className="table-row" key={parent.id} style={{ gridTemplateColumns: '2fr 2fr 2fr 1fr' }}><b>{parent.fullName}</b><span>{parent.email}</span><span>{parent.childName || 'Unlinked'}</span><button className="delete-button" onClick={() => deleteAccount(parent.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><Trash2 size={15}/> Delete</button></div>)}</div></article>

    <div className="two-column" style={{ marginTop: '24px' }}>
      <article className="card">
        <div className="card-heading"><div><span className="eyebrow">ANNOUNCEMENTS</span><h2>Post a campus update</h2></div></div>
        <form className="admin-form" onSubmit={postAnnouncement} style={{ marginTop: '16px' }}>
          <input value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Announcement title" required/>
          <textarea value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} placeholder="Message" required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dce4ef', width: '100%', minHeight: '90px' }}/>
          <select value={announcementForm.section} onChange={e => setAnnouncementForm({ ...announcementForm, section: e.target.value })}>
            <option value="ALL">Campus-wide</option>
            <option value="A1">Section A1</option>
            <option value="B1">Section B1</option>
            <option value="C1">Section C1</option>
          </select>
          <button className="primary-button">Post announcement</button>
        </form>
        {announcementMsg && <p className="form-message" style={{ marginTop: '12px' }}>{announcementMsg}</p>}
      </article>
      <article className="card">
        <div className="card-heading"><div><span className="eyebrow">RECENT</span><h2>All announcements</h2></div></div>
        <div style={{ display: 'grid', gap: '12px', padding: '24px', maxHeight: '340px', overflowY: 'auto' }}>
          {announcements.length === 0 ? <p style={{ color: '#64748b' }}>No announcements posted yet.</p> : announcements.map(item => (
            <div key={item.id} style={{ borderLeft: '4px solid #2868cc', background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge good">{item.section ? `Section ${item.section}` : 'Campus-wide'}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <strong style={{ display: 'block', fontSize: '14px', marginTop: '8px' }}>{item.title}</strong>
              <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 8px' }}>{item.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.authorName} · {item.authorRole === 'ADMIN' ? 'Administration' : 'Faculty'}</span>
                <button onClick={() => deleteAnnouncement(item.id)} style={{ color: '#ef4444', border: '1px solid #ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>

    <div className="module-grid admin-grid" style={{ marginTop: '24px' }}>
      <article className="card">
        <div className="account-toggle"><button className={accountType === 'STUDENT' ? 'selected' : ''} type="button" onClick={() => setAccountType('STUDENT')}>Enroll student</button><button className={accountType === 'TEACHER' ? 'selected' : ''} type="button" onClick={() => { setAccountType('TEACHER'); setCreateParent(false); }}>Enroll teacher</button></div>
        <span className="eyebrow">CREATE {accountType} ACCOUNT</span><h2>{accountType === 'STUDENT' ? 'Enroll a student' : 'Assign a section teacher'}</h2>
        <p className="form-copy">A real onboarding email with a temporary password is sent to the address below.</p>
        <form className="admin-form" onSubmit={createAccount}>
          <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder={`${accountType === 'STUDENT' ? 'Student' : 'Teacher'} full name`} required/>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Real email address" required/>
          <div><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Login username" required/><input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" minLength={8} required/></div>
          {accountType === 'STUDENT' && <><input value={form.registerNo} onChange={e => setForm({ ...form, registerNo: e.target.value })} placeholder="Register number" required/><div><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" required/><select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}><option>A1</option><option>B1</option><option>C1</option></select></div></>}
          {accountType === 'TEACHER' && <label>Assigned section<select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}><option>A1</option><option>B1</option><option>C1</option></select></label>}
          {accountType === 'STUDENT' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', fontSize: '13px', color: '#42607e', margin: '4px 0' }}>
              <input type="checkbox" checked={createParent} onChange={e => setCreateParent(e.target.checked)} style={{ width: 'auto' }}/> Also create a parent account for this student
            </label>
          )}
          {accountType === 'STUDENT' && createParent && (
            <div style={{ border: '1px dashed #b8c7dc', borderRadius: '10px', padding: '14px', display: 'grid', gap: '10px' }}>
              <span className="eyebrow">PARENT ACCOUNT</span>
              <input value={parentForm.parentFullName} onChange={e => setParentForm({ ...parentForm, parentFullName: e.target.value })} placeholder="Parent full name" required/>
              <input type="email" value={parentForm.parentEmail} onChange={e => setParentForm({ ...parentForm, parentEmail: e.target.value })} placeholder="Parent email address" required/>
              <div><input value={parentForm.parentUsername} onChange={e => setParentForm({ ...parentForm, parentUsername: e.target.value })} placeholder="Parent login username" required/><input value={parentForm.parentPassword} onChange={e => setParentForm({ ...parentForm, parentPassword: e.target.value })} placeholder="Parent temporary password" minLength={8} required/></div>
            </div>
          )}
          <button className="primary-button">Create account &amp; send email</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </article>
      <article className="card"><span className="eyebrow">ONBOARDING FLOW</span><h2>Secure first access</h2><ol className="onboarding-steps"><li>Admin creates the account and temporary password.</li><li>CampusOS emails the login link and credentials to the real address.</li><li>The recipient signs in using the temporary password.</li><li>CampusOS immediately requires a new password before access.</li></ol><p className="access-note">SMTP credentials are kept in <code>.env.local</code>, never in the admin interface or SQLite database.</p></article>
    </div>
  </div></main>;
}
function StudentDetailPage({ studentId, onBack, onDelete, logout }: { studentId: number; onBack: () => void; onDelete: (id: number) => void; logout: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/students/${studentId}`).then(r => r.json()).then(r => { setDetail(r); setLoading(false); });
  }, [studentId]);

  return <main className="erp-shell"><header className="erp-top"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span>Administrator ERP</span><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="erp-page">
    <button className="outline-button" onClick={onBack} style={{ marginBottom: '16px' }}>Back to student directory</button>
    {loading || !detail ? <p>Loading student profile...</p> : (
      <>
        <SectionHeader label="STUDENT PROFILE" title={detail.student.fullName} text={`Register no. ${detail.student.registerNo} · Section ${detail.student.section} · ${detail.student.department}`} />
        <div className="module-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          <article className="metric-card"><span>CGPA</span><strong>{detail.student.cgpa}</strong></article>
          <article className="metric-card"><span>Attendance</span><strong className={detail.student.attendance < 75 ? 'warning-text' : ''}>{detail.student.attendance}%</strong></article>
          <article className="metric-card"><span>Username</span><strong>{detail.student.username}</strong></article>
          <article className="metric-card"><span>Password reset needed</span><strong>{detail.student.mustResetPassword ? 'Yes' : 'No'}</strong></article>
        </div>
        <article className="card" style={{ marginTop: '24px' }}>
          <div className="card-heading"><div><span className="eyebrow">CONTACT DETAILS</span><h2>Personal information</h2></div></div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Email</span><strong style={{ fontSize: '15px' }}>{detail.student.email}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Student Phone</span><strong style={{ fontSize: '15px' }}>{detail.student.studentPhone || 'Not on file'}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Parent Phone</span><strong style={{ fontSize: '15px' }}>{detail.student.parentPhone || 'Not on file'}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Department</span><strong style={{ fontSize: '15px' }}>{detail.student.department}</strong></div>
          </div>
        </article>
        <article className="card" style={{ marginTop: '24px' }}>
          <div className="card-heading"><div><span className="eyebrow">HOSTEL / TRANSPORT</span><h2>Fees &amp; allocation</h2></div></div>
          {!detail.fees ? <p style={{ padding: '24px', color: '#64748b' }}>No hostel or transport service assigned.</p> : (
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Service Type</span><strong style={{ fontSize: '15px' }}>{detail.fees.type === 'HOSTEL' ? 'Campus Hostel Residence' : 'Route Transport Bus'}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Payment Status</span><span className={`badge ${detail.fees.status === 'PAID' ? 'good' : 'warning'}`}>{detail.fees.status}</span></div>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Amount</span><strong style={{ fontSize: '15px' }}>₹{detail.fees.amount?.toLocaleString()}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Paid</span><strong style={{ fontSize: '15px' }}>₹{detail.fees.paid?.toLocaleString()}</strong></div>
              {detail.fees.allocation && detail.fees.type === 'HOSTEL' && (
                <>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Room</span><strong style={{ fontSize: '15px' }}>{detail.fees.allocation.roomNo}, {detail.fees.allocation.blockName}</strong></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Warden</span><strong style={{ fontSize: '15px' }}>{detail.fees.allocation.wardenName}</strong></div>
                </>
              )}
              {detail.fees.allocation && detail.fees.type !== 'HOSTEL' && (
                <>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Pickup Location</span><strong style={{ fontSize: '15px' }}>{detail.fees.allocation.location}</strong></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Route</span><strong style={{ fontSize: '15px' }}>{detail.fees.allocation.routeNo}</strong></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Driver</span><strong style={{ fontSize: '15px' }}>{detail.fees.allocation.driverName} · {detail.fees.allocation.driverPhone}</strong></div>
                </>
              )}
            </div>
          )}
        </article>
        <div className="two-column" style={{ marginTop: '24px' }}>
          <article className="card">
            <div className="card-heading"><div><span className="eyebrow">SAFETY</span><h2>Incident logs ({detail.safetyIncidents.length})</h2></div></div>
            <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
              {detail.safetyIncidents.length === 0 ? <p style={{ color: '#64748b' }}>No safety incidents reported.</p> : detail.safetyIncidents.map((inc: any) => (
                <div key={inc.id} style={{ borderLeft: `4px solid ${inc.type === 'EMERGENCY' ? '#ef4444' : '#3b82f6'}`, background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className={`badge ${inc.status === 'RESOLVED' ? 'good' : 'warning'}`}>{inc.status}</span><span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(inc.createdAt).toLocaleString()}</span></div>
                  <strong style={{ display: 'block', marginTop: '8px', fontSize: '14px' }}>{inc.title}</strong>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0' }}>{inc.description}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="card">
            <div className="card-heading"><div><span className="eyebrow">WELLNESS</span><h2>Check-in history ({detail.wellbeingCheckins.length})</h2></div></div>
            <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
              {detail.wellbeingCheckins.length === 0 ? <p style={{ color: '#64748b' }}>No wellbeing check-ins logged.</p> : detail.wellbeingCheckins.map((chk: any) => (
                <div key={chk.id} style={{ borderLeft: `4px solid ${chk.moodScore <= 2 ? '#ef4444' : '#10b981'}`, background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: '14px' }}>Mood: {chk.moodScore}/5</strong><span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(chk.createdAt).toLocaleDateString()}</span></div>
                  {chk.notes && <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0', fontStyle: 'italic' }}>"{chk.notes}"</p>}
                </div>
              ))}
            </div>
          </article>
        </div>
        <article className="card" style={{ marginTop: '24px' }}>
          <div className="card-heading"><div><span className="eyebrow">HOSTEL EXITS</span><h2>Gatepass request history ({detail.hostelExits.length})</h2></div></div>
          <div style={{ display: 'grid', gap: '12px', padding: '24px' }}>
            {detail.hostelExits.length === 0 ? <p style={{ color: '#64748b' }}>No gatepass requests logged.</p> : detail.hostelExits.map((exit: any) => (
              <div key={exit.id} style={{ borderLeft: '4px solid #2868cc', background: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e4eaf2', borderLeftWidth: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className={`badge ${exit.status === 'APPROVED' ? 'good' : 'warning'}`}>{exit.status}</span><span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(exit.createdAt).toLocaleString()}</span></div>
                <strong style={{ display: 'block', marginTop: '8px', fontSize: '14px' }}>{exit.durationHours}h · {exit.reason}</strong>
              </div>
            ))}
          </div>
        </article>
        <button className="delete-button" onClick={() => onDelete(studentId)} style={{ color: '#ef4444', background: 'none', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginTop: '24px' }}><Trash2 size={15}/> Delete this account</button>
      </>
    )}
  </div></main>;
}
function ParentWorkspace({ user, logout }: { user: User; logout: () => void }) {
  const [overview, setOverview] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  useEffect(() => {
    const query = selectedChildId ? `?studentId=${selectedChildId}` : '';
    fetch(`/api/parent/overview${query}`).then(r => r.json()).then(r => { setOverview(r); if (r.selectedStudentId) setSelectedChildId(r.selectedStudentId); });
  }, [selectedChildId]);

  if (!overview) return <main className="loading"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><p>Loading your child's workspace…</p></main>;

  if (!overview.children || overview.children.length === 0) {
    return <main className="erp-shell"><header className="erp-top"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span>Parent Portal</span><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="erp-page"><SectionHeader label="PARENT PORTAL" title={`Welcome, ${user.fullName}`} text="No student is linked to your account yet. Contact the administration office." /></div></main>;
  }

  const child = overview.selectedStudent;
  const overall = overview.attendance?.length ? Math.round(overview.attendance.reduce((sum: number, item: any) => sum + item.attended, 0) * 100 / overview.attendance.reduce((sum: number, item: any) => sum + item.total, 0)) : 0;

  return <main className="erp-shell"><header className="erp-top"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span>Parent Portal</span><button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button></header><div className="erp-page">
    <SectionHeader label="PARENT PORTAL" title={`Welcome, ${user.fullName}`} text="A read-only view of your child's academics, attendance and campus life." />
    {overview.children.length > 1 && (
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: '#fff', padding: '8px', borderRadius: '12px', border: '1px solid #e4eaf2', width: 'fit-content' }}>
        {overview.children.map((c: any) => (
          <button key={c.id} onClick={() => setSelectedChildId(c.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', background: selectedChildId === c.id ? '#2868cc' : 'none', color: selectedChildId === c.id ? '#fff' : '#64748b' }}>{c.fullName}</button>
        ))}
      </div>
    )}
    <div className="placement-summary">
      <article><span>Student</span><strong style={{ fontSize: '20px' }}>{child.fullName}</strong><p>Register no. {child.registerNo} · Section {child.section}</p></article>
      <article><span>CGPA</span><strong>{child.cgpa}</strong><p>{child.department}</p></article>
      <article><span>Attendance</span><strong className={overall < 75 ? 'warning-text' : ''}>{overall}%</strong><p>Overall across all subjects.</p></article>
    </div>
    <TimetableWidget today={overview.timetable} week={overview.weekTimetable} />
    <AnnouncementsFeed announcements={overview.announcements} />
    <div className="two-column" style={{ marginTop: '24px' }}>
      <article className="card table-card">
        <div className="card-heading"><div><span className="eyebrow">ATTENDANCE</span><h2>Subject-wise attendance</h2></div></div>
        <div className="data-table">
          <div className="table-head"><span>Subject</span><span>Attended</span><span>Percentage</span><span>Trend</span><span>Status</span></div>
          {(overview.attendance ?? []).map((row: any) => (
            <div className="table-row" key={row.subject}><b>{row.subject}</b><span>{row.attended} / {row.total}</span><b className={row.percentage < 75 ? 'warning-text' : ''}>{row.percentage}%</b><span className={row.trend < 0 ? 'warning-text' : 'positive-text'}>{row.trend > 0 ? '↑' : '↓'} {Math.abs(row.trend)} pts</span><span className={row.percentage < 75 ? 'badge warning' : 'badge good'}>{row.percentage < 75 ? 'At risk' : 'Healthy'}</span></div>
          ))}
        </div>
      </article>
      <article className="card table-card">
        <div className="card-heading"><div><span className="eyebrow">MARKS</span><h2>Internal assessment marks</h2></div></div>
        <div className="data-table">
          <div className="table-head"><span>Subject</span><span>Internal 1</span><span>Internal 2</span><span>Assignment</span></div>
          {(overview.marks ?? []).map((row: any) => (
            <div className="table-row" key={row.subject} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}><b>{row.subject}</b><span>{row.internal1}</span><span>{row.internal2}</span><span>{row.assignment}</span></div>
          ))}
        </div>
      </article>
    </div>
    {overview.fees && (
      <article className="card" style={{ marginTop: '24px' }}>
        <div className="card-heading"><div><span className="eyebrow">HOSTEL / TRANSPORT</span><h2>Fees &amp; allocation</h2></div></div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Service Type</span><strong>{overview.fees.type === 'HOSTEL' ? 'Campus Hostel Residence' : 'Route Transport Bus'}</strong></div>
          <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Status</span><span className={`badge ${overview.fees.status === 'PAID' ? 'good' : 'warning'}`}>{overview.fees.status}</span></div>
          <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Amount</span><strong>₹{overview.fees.amount?.toLocaleString()}</strong></div>
          <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Paid</span><strong>₹{overview.fees.paid?.toLocaleString()}</strong></div>
        </div>
      </article>
    )}
  </div></main>;
}
function PasswordReset({ user, done }: { user: User; done: (user: User) => void }) { const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [message, setMessage] = useState(''); async function submit(event: FormEvent) { event.preventDefault(); if (password !== confirm) return setMessage('Passwords do not match.'); try { const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); const text = await response.text(); let result: any = null; if (text) { try { result = JSON.parse(text); } catch { result = { error: text }; } } if (!response.ok) return setMessage(result?.error || `Password reset failed (Status ${response.status})`); done({ ...user, mustResetPassword: 0 }); } catch (err: any) { setMessage(err.message || 'Network error.'); } } return <main className="login-shell"><section className="login-copy"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><span className="eyebrow">FIRST-TIME SECURITY</span><h1>Set your own password.</h1><p>You signed in with a temporary password. Choose a new private password to continue.</p></section><section className="login-panel"><form onSubmit={submit}><div className="login-heading"><h2>Reset password</h2><p>For {user.username}</p></div><label>New password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required/></label><label>Confirm password<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required/></label>{message && <div className="form-error">{message}</div>}<button className="primary-button">Save new password</button></form></section></main>; }
function CountdownClock({ approvedAt, durationHours, onExpired }: { approvedAt: string; durationHours: number; onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const expiresAt = new Date(approvedAt).getTime() + durationHours * 60 * 60 * 1000;
    const update = () => {
      const diff = expiresAt - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft(0);
        onExpired();
      } else {
        setTimeLeft(diff);
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [approvedAt, durationHours]);

  if (timeLeft === 0) {
    return (
      <div style={{ background: '#fef2f2', border: '2px dashed #ef4444', padding: '24px', borderRadius: '16px', textAlign: 'center', marginTop: '16px' }}>
        <strong style={{ color: '#ef4444', fontSize: '24px' }}>EXPIRED</strong>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0' }}>Your exit leave permission time has run out.</p>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return (
    <div style={{ background: '#fef2f2', border: '2px dashed #ef4444', padding: '24px', borderRadius: '16px', textAlign: 'center', marginTop: '16px' }}>
      <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>⏳ Gatepass Permission Time Remaining</span>
      <strong style={{ fontSize: '32px', color: '#b91c1c', fontFamily: 'monospace', display: 'block', marginTop: '8px' }}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </strong>
      <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Started: {new Date(approvedAt).toLocaleTimeString()}</span>
    </div>
  );
}

function HostelTransportPage({ user, data }: { user: User; data: Overview }) {
  const fees = data.fees;
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [duration, setDuration] = useState('2');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadActiveRequest = () => {
    fetch('/api/hostel/exit')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setActiveRequest(d.activeRequest))
      .catch(() => setActiveRequest(null));
  };

  useEffect(() => {
    if (fees?.type === 'HOSTEL') {
      loadActiveRequest();
    }
  }, [fees]);

  async function submitRequest(e: FormEvent) {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      const res = await fetch('/api/hostel/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationHours: Number(duration), reason })
      });
      const resData = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg('Leave request submitted to warden successfully!');
        setReason('');
        loadActiveRequest();
      } else {
        setMsg(resData.error || 'Failed to submit request.');
      }
    } catch {
      setLoading(false); setMsg('Error submitting request.');
    }
  }

  if (!fees) return <p style={{ padding: '24px' }}>Loading services information...</p>;

  return (
    <>
      <SectionHeader label="SERVICES" title="Campus Services Workspace" text="Manage your campus hostel permissions or bus transportation schedule." />
      <div className="module-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {fees.type === 'HOSTEL' ? (
          <>
            <article className="card">
              <div className="card-heading"><div><span className="eyebrow">RESIDENCE CARD</span><h2>Hostel Accommodation Details</h2></div></div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Block name</span><strong style={{ fontSize: '16px', color: '#0f172a' }}>{fees.details?.blockName || 'Ramanujan Block'}</strong></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Room number</span><strong style={{ fontSize: '16px', color: '#0f172a' }}>{fees.details?.roomNo || 'N/A'}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Block Warden</span><strong style={{ fontSize: '16px', color: '#2868cc' }}>{fees.details?.wardenName || 'Mr. Rajesh Kumar'}</strong></div>
                </div>

                {activeRequest && activeRequest.status === 'APPROVED' && (
                  <CountdownClock approvedAt={activeRequest.approvedAt} durationHours={activeRequest.durationHours} onExpired={loadActiveRequest} />
                )}

                {activeRequest && activeRequest.status === 'PENDING' && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="badge warning" style={{ width: 'fit-content' }}>Warden Review Pending</span>
                    <p style={{ fontSize: '13px', color: '#451a03', margin: 0 }}>
                      Leave ticket for <strong>{activeRequest.durationHours} hours</strong> is waiting for warden approval.
                    </p>
                    <span style={{ fontSize: '11px', color: '#b45309' }}>Reason: "{activeRequest.reason}"</span>
                  </div>
                )}
              </div>
            </article>

            <article className="card">
              <span className="eyebrow">GATEPASS PORTAL</span>
              <h2>Apply for Exit Permission</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>Submit a leave slip to receive warden check-out approval.</p>
              <form className="admin-form" onSubmit={submitRequest}>
                <label>Permission duration (Hours)
                  <select value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="2">2 Hours (Local errand)</option>
                    <option value="4">4 Hours (Day outing)</option>
                    <option value="8">8 Hours (Extended outing)</option>
                    <option value="24">24 Hours (Overnight leave)</option>
                  </select>
                </label>
                <label>Reason for exit
                  <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Type details (e.g. visiting family, buying textbooks)" required style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginTop: '4px' }} />
                </label>
                <button className="primary-button" disabled={loading || (activeRequest && activeRequest.status === 'PENDING')} style={{ marginTop: '10px' }}>
                  {loading ? 'Submitting...' : 'Apply for Exit Slip'}
                </button>
              </form>
              {msg && <p className="form-message" style={{ marginTop: '12px' }}>{msg}</p>}
            </article>
          </>
        ) : (
          <article className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-heading"><div><span className="eyebrow">ROUTE BOARD</span><h2>Transport Service Allocation</h2></div></div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Pickup Location</span>
                <strong style={{ fontSize: '18px', color: '#0f172a' }}>{fees.details?.location || 'Tambaram Circle'}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Bus Route Number</span>
                <strong style={{ fontSize: '18px', color: '#2868cc' }}>{fees.details?.routeNo || 'R-10'}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Driver Details</span>
                <strong style={{ fontSize: '18px', color: '#0f172a' }}>{fees.details?.driverName || 'Mr. Murugan'}</strong>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{fees.details?.driverPhone || '9840123456'}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Daily Timetable Schedule</span>
                <div style={{ display: 'flex', gap: '24px', marginTop: '6px' }}>
                  <div>Morning Pickup: <strong>{fees.details?.pickupTime || '07:45 AM'}</strong></div>
                  <div>Evening Dropoff: <strong>{fees.details?.dropTime || '04:30 PM'}</strong></div>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </>
  );
}

function WardenWorkspace({ user, logout }: { user: User; logout: () => void }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = () => {
    fetch('/api/warden/requests')
      .then(r => r.json())
      .then(d => { setTickets(d.requests ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, []);

  async function handleAction(id: number, action: 'APPROVE' | 'REJECT') {
    const res = await fetch('/api/warden/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    });
    if (res.ok) {
      loadTickets();
    } else {
      alert('Failed to update request.');
    }
  }

  return (
    <main className="erp-shell">
      <header className="erp-top">
        <div className="brand"><div className="brand-mark">C</div>CampusOS</div>
        <span>Hostel Warden ERP</span>
        <button className="logout" onClick={logout}><LogOut size={16}/> Sign out</button>
      </header>
      <div className="erp-page">
        <SectionHeader label="WARDEN WORKSPACE" title="Hostel Gatepass Dispatch" text="Review and approve student exit permission slips and leave tickets." />
        
        <article className="card" style={{ marginTop: '24px' }}>
          <div className="card-heading">
            <div>
              <span className="eyebrow">TICKET REGISTER</span>
              <h2>Pending & Active Requests ({tickets.length})</h2>
            </div>
          </div>
          {loading ? (
            <p style={{ padding: '24px' }}>Loading gatepass tickets...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', padding: '24px' }}>
              {tickets.length === 0 ? (
                <p>No active exit requests found.</p>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${ticket.status === 'PENDING' ? 'warning' : (ticket.status === 'APPROVED' ? 'good' : 'warning')}`}>{ticket.status}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block' }}>{ticket.studentName}</strong>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Course: {ticket.department || 'CSE'} · Class Teacher: {ticket.classTeacherName || 'N/A'}</span>
                    </div>
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e4eaf2', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>Student Ph: <strong>{ticket.studentPhone || 'N/A'}</strong></span>
                        <span>Parent Ph: <strong>{ticket.parentPhone || 'N/A'}</strong></span>
                      </div>
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '6px' }}>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>REASON FOR EXIT ({ticket.durationHours} hrs):</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{ticket.reason}</p>
                      </div>
                    </div>
                    {ticket.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button onClick={() => handleAction(ticket.id, 'APPROVE')} style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Approve Gatepass</button>
                        <button onClick={() => handleAction(ticket.id, 'REJECT')} style={{ padding: '10px', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}

function RolePlaceholder({ user, logout }: { user: User; logout: () => void }) {
  if (user.role === 'ADMIN') return <AdminWorkspace user={user} logout={logout}/>;
  if (user.role === 'WARDEN') return <WardenWorkspace user={user} logout={logout}/>;
  if (user.role === 'PARENT') return <ParentWorkspace user={user} logout={logout}/>;
  return <TeacherWorkspace user={user} logout={logout}/>;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null); const [data, setData] = useState<Overview | null>(null); const [page, setPage] = useState('Dashboard');
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('onboard')) {
      localStorage.removeItem('campusos-user');
      document.cookie = 'campusos-session=; path=/; max-age=0';
      window.history.replaceState({}, '', '/');
      return;
    }
    const saved = localStorage.getItem('campusos-user'); if (saved) setUser(JSON.parse(saved));
  }, []);
  useEffect(() => { if (user?.role === 'STUDENT') fetch('/api/student/overview').then(r => r.json()).then(setData); }, [user]);
  const logout = () => { localStorage.removeItem('campusos-user'); setUser(null); setData(null); setPage('Dashboard'); };
  if (!user) return <Login onSuccess={setUser}/>;
  if (user.mustResetPassword) return <PasswordReset user={user} done={(updatedUser) => { localStorage.setItem('campusos-user', JSON.stringify(updatedUser)); setUser(updatedUser); }} />;
  if (user.role !== 'STUDENT') return <RolePlaceholder user={user} logout={logout}/>;
  if (!data) return <main className="loading"><div className="brand"><div className="brand-mark">C</div>CampusOS</div><p>Loading your intelligence layer…</p></main>;
  return <StudentDashboard user={user} data={data} logout={logout} page={page} setPage={setPage} updateData={setData}/>;
}

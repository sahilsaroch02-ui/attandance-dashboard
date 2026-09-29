import { useEffect, useState } from 'react'

const API = 'http://localhost:5001/api'
const today = new Date().toISOString().slice(0, 10)

function App() {
  const [user, setUser] = useState(null)
  const [login, setLogin] = useState(true)
  const [page, setPage] = useState('Overview')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [message, setMessage] = useState('')
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [lectures, setLectures] = useState([])
  const [search, setSearch] = useState('')
  const [mark, setMark] = useState({ student_id: '', lecture_id: '', status: 'present', attendance_date: today })

  async function submit(event) {
    event.preventDefault()
    const endpoint = login ? '/auth/signin' : '/auth/signup'
    const response = await fetch(API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await response.json()
    setMessage(data.message || '')
    if (login && data.token) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
  }

  async function loadDashboard() {
    const headers = { Authorization: 'Bearer ' + localStorage.getItem('token') }
    const lectureResponse = await fetch(API + '/lectures', { headers })
    setLectures(await lectureResponse.json())
    if (user.role === 'student') {
      const response = await fetch(API + '/attendance/me', { headers })
      setAttendance(await response.json())
    } else {
      const response = await fetch(API + '/attendance/students', { headers })
      setStudents(await response.json())
    }
  }

  useEffect(() => {
    if (user) loadDashboard()
  }, [user])

  async function saveAttendance(event) {
    event.preventDefault()
    const response = await fetch(API + '/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
      body: JSON.stringify(mark)
    })
    const data = await response.json()
    setMessage(data.message || 'Attendance saved')
    setPage('Overview')
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    setMessage('')
  }

  if (!user) {
    return <AuthScreen login={login} setLogin={setLogin} form={form} setForm={setForm} submit={submit} message={message} />
  }

  const present = attendance.filter(item => item.status === 'present').length
  const percentage = attendance.length ? Math.round(present / attendance.length * 100) : 0
  const visibleStudents = students.filter(student => student.name.toLowerCase().includes(search.toLowerCase()) || student.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="app-shell">
      <Sidebar user={user} page={page} setPage={setPage} logout={logout} />
      <section className="content-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark small">A</span> attendly</div>
          <div className="date-stamp">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <div className="top-actions"><button className="icon-button">♧<i /></button><div className="avatar">{user.name[0]}</div></div>
        </header>
        <div className="content-heading">
          <div><p className="eyebrow">{user.role === 'teacher' ? 'TEACHING OVERVIEW' : 'YOUR LEARNING OVERVIEW'}</p><h1>{page}</h1><p className="subheading">{user.role === 'teacher' ? 'Keep your classroom moving forward.' : 'Small check-ins make a big difference.'}</p></div>
          {page === 'Overview' && <button className="primary-button compact" onClick={() => setPage(user.role === 'teacher' ? 'Mark attendance' : 'Schedule')}>{user.role === 'teacher' ? '＋ Mark attendance' : 'View schedule →'}</button>}
        </div>
        {page === 'Overview' && (user.role === 'student' ? <StudentOverview attendance={attendance} percentage={percentage} lectures={lectures} /> : <TeacherOverview students={students} lectures={lectures} setPage={setPage} />)}
        {page === 'Mark attendance' && <MarkAttendance lectures={lectures} students={students} mark={mark} setMark={setMark} saveAttendance={saveAttendance} message={message} />}
        {page === 'Students' && <Students students={visibleStudents} search={search} setSearch={setSearch} />}
        {page === 'Schedule' && <Schedule lectures={lectures} />}
      </section>
    </main>
  )
}

function AuthScreen({ login, setLogin, form, setForm, submit, message }) {
  return (
    <main className="auth-screen">
      <section className="auth-intro"><span className="brand-mark">A</span><h1>Attendance,<br /><em>without the guesswork.</em></h1><p className="intro-copy">A calmer way to follow every lecture, every student, and every day that matters.</p><div className="intro-note">✦ Built for focused classrooms</div></section>
      <form className="auth-card" onSubmit={submit}>
        <div className="form-heading"><p className="eyebrow">{login ? 'WELCOME BACK' : 'GET STARTED'}</p><h2>{login ? 'Sign in to your space' : 'Create your space'}</h2><p>{login ? 'Your attendance story is waiting.' : 'Set up your campus account in seconds.'}</p></div>
        {!login && <label>Name<input required placeholder="Your full name" onChange={e => setForm({ ...form, name: e.target.value })} /></label>}
        <label>Email<input required placeholder="you@campus.edu" type="email" onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input required placeholder="Enter your password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} /></label>
        {!login && <label>Account type<select onChange={e => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="teacher">Teacher</option></select></label>}
        <button className="primary-button">{login ? 'Enter dashboard' : 'Create account'} <span>→</span></button><p className="form-message">{message}</p>
        <button type="button" className="text-button" onClick={() => setLogin(!login)}>{login ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
      </form>
    </main>
  )
}

function Sidebar({ user, page, setPage, logout }) {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark small">A</span><span>attendly</span></div><div className="profile-mini"><div className="avatar">{user.name[0]}</div><div><strong>{user.name}</strong><small>{user.role}</small></div></div><nav><p className="nav-label">WORKSPACE</p><NavButton active={page === 'Overview'} onClick={() => setPage('Overview')} icon="◈">Overview</NavButton>{user.role === 'teacher' && <NavButton active={page === 'Mark attendance'} onClick={() => setPage('Mark attendance')} icon="＋">Mark attendance</NavButton>}{user.role === 'teacher' && <NavButton active={page === 'Students'} onClick={() => setPage('Students')} icon="♧">Students</NavButton>}<NavButton active={page === 'Schedule'} onClick={() => setPage('Schedule')} icon="▦">Schedule</NavButton></nav><div className="sidebar-bottom"><div className="help-box"><strong>Need a hand?</strong><span>Check your lecture schedule anytime.</span></div><NavButton onClick={logout} icon="↪">Log out</NavButton></div></aside>
}

function NavButton({ active, onClick, icon, children }) {
  return <button className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}><span>{icon}</span>{children}</button>
}

function StudentOverview({ attendance, percentage, lectures }) {
  const records = attendance.slice(-5).reverse()
  return <div className="dashboard-grid"><section className="stat-row"><article className="stat-card highlight"><div><span className="card-label">Overall attendance</span><strong>{percentage}%</strong><small>{percentage >= 75 ? 'You are on track' : 'Needs your attention'}</small></div><div className="progress-ring" style={{ '--progress': `${percentage * 3.6}deg` }}><span>{percentage}%</span></div></article><article className="stat-card"><span className="card-label">Present lectures</span><strong>{attendance.filter(item => item.status === 'present').length}</strong><small className="positive">↑ Keep showing up</small><span className="stat-icon green">✓</span></article><article className="stat-card"><span className="card-label">Lectures tracked</span><strong>{attendance.length}</strong><small>Across your schedule</small><span className="stat-icon cream">▦</span></article></section><section className="wide-card attendance-card"><Title eyebrow="RECENT ACTIVITY" title="Your attendance rhythm" tag={`${attendance.length} records`} /><div className="bar-chart">{(attendance.length ? attendance.slice(-7) : lectures).map((item, index) => <div className="bar-column" key={item.id || index}><div className={item.status === 'absent' ? 'bar absent-bar' : 'bar'} style={{ height: `${item.status === 'absent' ? 34 : 78 - index * 4}px` }} /><span>{item.lecture_number ? `L${item.lecture_number}` : `L${index + 1}`}</span></div>)}</div><div className="chart-legend"><span><i className="legend-dot present-dot" /> Present</span><span><i className="legend-dot absent-dot" /> Absent</span><span className="chart-note">Last 7 tracked lectures</span></div></section><section className="wide-card"><Title eyebrow="LATEST RECORDS" title="Attendance history" />{records.length === 0 ? <EmptyState /> : <div className="record-list">{records.map(item => <div className="record" key={item.id}><div className="record-icon">L{item.lecture_number}</div><div><strong>Lecture {item.lecture_number}</strong><small>{item.attendance_date}</small></div><span className={item.status === 'present' ? 'status present-status' : 'status absent-status'}>{item.status}</span></div>)}</div>}</section><Schedule lectures={lectures} /></div>
}

function TeacherOverview({ students, lectures, setPage }) {
  return <div className="dashboard-grid"><section className="stat-row"><article className="stat-card highlight"><span className="card-label">Your classroom</span><strong>{students.length}</strong><small>students enrolled</small><span className="stat-icon white">♧</span></article><article className="stat-card"><span className="card-label">Today's lectures</span><strong>{lectures.length}</strong><small>on your schedule</small><span className="stat-icon green">▦</span></article><article className="stat-card"><span className="card-label">Quick action</span><strong>+</strong><button className="inline-action" onClick={() => setPage('Mark attendance')}>Mark attendance →</button></article></section><section className="wide-card teacher-hero"><div><p className="eyebrow">CLASSROOM CONTROL</p><h2>Make every presence count.</h2><p>Record attendance in a few clicks and keep your class data ready when you need it.</p><button className="primary-button compact" onClick={() => setPage('Mark attendance')}>Start marking <span>→</span></button></div><div className="hero-shape"><span>✓</span><small>Today<br />is a good day to teach.</small></div></section><Schedule lectures={lectures} /><section className="wide-card"><Title eyebrow="PEOPLE" title="Student directory" tag={`${students.length} students`} /><div className="record-list">{students.slice(0, 4).map(student => <div className="record" key={student.id}><div className="avatar">{student.name[0]}</div><div><strong>{student.name}</strong><small>{student.email}</small></div><span className="status neutral-status">Student</span></div>)}</div></section></div>
}

function MarkAttendance({ lectures, students, mark, setMark, saveAttendance, message }) {
  return <section className="wide-card form-card"><Title eyebrow="CLASSROOM CONTROL" title="Mark attendance" /><p className="subheading">Choose a student, lecture, and status.</p><form onSubmit={saveAttendance} className="attendance-form"><label>Student<select required value={mark.student_id} onChange={e => setMark({ ...mark, student_id: e.target.value })}><option value="">Choose a student</option>{students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label><label>Lecture<select required value={mark.lecture_id} onChange={e => setMark({ ...mark, lecture_id: e.target.value })}><option value="">Choose a lecture</option>{lectures.map(lecture => <option key={lecture.id} value={lecture.id}>Lecture {lecture.lecture_number} · {lecture.start_time.slice(0, 5)}</option>)}</select></label><label>Date<input type="date" value={mark.attendance_date} onChange={e => setMark({ ...mark, attendance_date: e.target.value })} /></label><label>Status<select value={mark.status} onChange={e => setMark({ ...mark, status: e.target.value })}><option value="present">Present</option><option value="absent">Absent</option></select></label><button className="primary-button form-submit">Save attendance <span>→</span></button></form><p className="form-message success-message">{message}</p></section>
}

function Students({ students, search, setSearch }) {
  return <section className="wide-card"><Title eyebrow="PEOPLE" title="Student directory" tag={`${students.length} shown`} /><p className="subheading">Find your classroom at a glance.</p><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email" /></div><div className="directory">{students.map(student => <div className="directory-row" key={student.id}><div className="avatar">{student.name[0]}</div><div><strong>{student.name}</strong><small>{student.email}</small></div><span className="status neutral-status">Active</span><span className="row-arrow">→</span></div>)}</div></section>
}

function Schedule({ lectures }) {
  return <section className="wide-card schedule-card"><Title eyebrow="TODAY'S PLAN" title="Lecture schedule" tag={`${lectures.length} lectures`} />{lectures.length === 0 ? <EmptyState /> : <div className="schedule-list">{lectures.map(lecture => <div className="schedule-item" key={lecture.id}><span className="lecture-number">0{lecture.lecture_number}</span><div><strong>Lecture {lecture.lecture_number}</strong><small>Classroom session</small></div><span className="time">{lecture.start_time.slice(0, 5)} – {lecture.end_time.slice(0, 5)}</span></div>)}</div>}</section>
}

function Title({ eyebrow, title, tag }) {
  return <div className="section-title"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{tag && <span className="soft-tag">{tag}</span>}</div>
}

function EmptyState() {
  return <div className="empty-state"><span>◌</span><p>No attendance records yet.</p><small>Your teacher's updates will appear here.</small></div>
}

export default App

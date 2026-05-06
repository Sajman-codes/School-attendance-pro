import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ClipboardList, BarChart2, FileText, LogOut, CheckCircle, XCircle, Save, UserPlus, Trash2, Calendar, TrendingUp } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'attendance', label: 'Mark Attendance', icon: ClipboardList },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'export', label: 'Export PDF', icon: FileText },
];

export default function DashboardPage() {
  const { teacher, logout } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState([]);
  const [stats, setStats] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [addingStudents, setAddingStudents] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  const className = teacher?.className;
  const classLabel = className?.replace('JSS', 'JSS ').replace('SSS', 'SSS ');

  useEffect(() => { loadStudents(); loadSummary(); loadStats(); }, []);
  useEffect(() => { loadAttendanceForDate(); }, [attendanceDate, students]);

  const loadStudents = async () => {
    const res = await axios.get('/api/students');
    setStudents(res.data);
  };

  const loadSummary = async () => {
    const res = await axios.get('/api/attendance/summary');
    setSummary(res.data);
  };

  const loadStats = async () => {
    const res = await axios.get('/api/attendance/stats');
    setStats(res.data);
  };

  const loadAttendanceForDate = async () => {
    if (!students.length) return;
    const res = await axios.get(`/api/attendance/date/${attendanceDate}`);
    setAttendanceRecords(res.data);
  };

  const markStudent = (studentId, status) => {
    setAttendanceRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const markAll = (status) => {
    setAttendanceRecords(prev => prev.map(r => ({ ...r, status })));
  };

  const saveAttendance = async () => {
    setSaving(true);
    const records = attendanceRecords.filter(r => r.status).map(r => ({ studentId: r.studentId, status: r.status }));
    await axios.post('/api/attendance/save', { date: attendanceDate, records });
    setSaving(false);
    setSaved(true);
    loadSummary();
    loadStats();
    setTimeout(() => setSaved(false), 2000);
  };

  const bulkAddStudents = async () => {
    const names = bulkNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (!names.length) return;
    setAddingStudents(true);
    try {
      const res = await axios.post('/api/students/bulk', { names });
      setAddMsg(`✅ ${res.data.students.length} students added successfully!`);
      setBulkNames('');
      loadStudents();
      loadSummary();
      setTimeout(() => setAddMsg(''), 4000);
    } catch (err) {
      setAddMsg('❌ Error adding students. Please try again.');
    }
    setAddingStudents(false);
  };

  const deleteStudent = async (id) => {
    if (!confirm('Delete this student and all their attendance records?')) return;
    await axios.delete(`/api/students/${id}`);
    loadStudents();
    loadSummary();
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFillColor(6, 11, 24);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE REPORT', 105, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${classLabel}  |  Teacher: ${teacher.fullName}`, 105, 28, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 105, 36, { align: 'center' });

    const tableData = summary.map((s, i) => [
      i + 1, s.name, s.admissionNo, s.present, s.absent, s.total,
      s.total > 0 ? `${s.percentage}%` : '-',
      s.percentage >= 75 ? 'ELIGIBLE' : s.total === 0 ? 'NO DATA' : 'AT RISK'
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Student Name', 'Admission No.', 'Present', 'Absent', 'Total', '%', 'Status']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [13, 21, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} — AttendTrack School System`, 105, 290, { align: 'center' });
    }

    doc.save(`attendance-${className}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const presentToday = attendanceRecords.filter(r => r.status === 'present').length;
  const absentToday = attendanceRecords.filter(r => r.status === 'absent').length;
  const unmarked = attendanceRecords.filter(r => !r.status).length;
  const avgAttendance = summary.length > 0 ? Math.round(summary.reduce((a, b) => a + b.percentage, 0) / summary.length) : 0;
  const atRisk = summary.filter(s => s.percentage < 75 && s.total > 0).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>AttendTrack</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{classLabel} — {teacher?.fullName}</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: active === id ? 'rgba(59,130,246,0.15)' : 'transparent', color: active === id ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: active === id ? 600 : 400, marginBottom: 2, cursor: 'pointer' }}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, padding: '36px 40px', minHeight: '100vh' }}>

        {/* ── DASHBOARD ── */}
        {active === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{classLabel} Dashboard</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Welcome back, {teacher?.fullName}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Total Students', value: students.length, color: '#3b82f6', icon: Users },
                { label: 'Avg Attendance', value: `${avgAttendance}%`, color: '#10b981', icon: TrendingUp },
                { label: 'Present Today', value: presentToday, color: '#10b981', icon: CheckCircle },
                { label: 'At Risk (<75%)', value: atRisk, color: '#ef4444', icon: XCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Attendance Trend</h3>
                {stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                      <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                      <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)' }} name="Attendance %" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>No data yet. Start marking attendance!</div>}
              </div>

              <div className="card">
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Today's Split</h3>
                {presentToday + absentToday > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={[{ name: 'Present', value: presentToday }, { name: 'Absent', value: absentToday }]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                        <Cell fill="#10b981" /><Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>Mark attendance first</div>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                  {[['#10b981', 'Present', presentToday], ['#ef4444', 'Absent', absentToday]].map(([color, label, val]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                      <span style={{ color: 'var(--text2)' }}>{label}: <strong>{val}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MARK ATTENDANCE ── */}
        {active === 'attendance' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Mark Attendance</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>{classLabel}</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                <Calendar size={15} color="var(--text2)" />
                <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <button onClick={() => markAll('present')} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✓ All Present</button>
              <button onClick={() => markAll('absent')} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✗ All Absent</button>
              <button onClick={saveAttendance} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saved ? '#10b981' : 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={13} />{saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Summary bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[['#10b981', 'Present', presentToday], ['#ef4444', 'Absent', absentToday], ['#f59e0b', 'Unmarked', unmarked]].map(([color, label, val]) => (
                <div key={label} className="card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}:</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 160px 140px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <span>#</span><span>Student Name</span><span>Admission No.</span><span style={{ textAlign: 'center' }}>Status</span>
              </div>
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {attendanceRecords.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No students yet. Add students first.</div>
                ) : attendanceRecords.map((r, i) => (
                  <div key={r.studentId} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 160px 140px', padding: '11px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', background: r.status === 'present' ? 'rgba(16,185,129,0.03)' : r.status === 'absent' ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.admissionNo}</span>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {[['present', 'P', '#10b981'], ['absent', 'A', '#ef4444']].map(([status, label, color]) => (
                        <button key={status} onClick={() => markStudent(r.studentId, status)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 6, border: '1px solid', borderColor: r.status === status ? color : 'var(--border)', background: r.status === status ? `${color}33` : 'transparent', color: r.status === status ? color : 'var(--text3)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {active === 'students' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Students</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>{classLabel} — {students.length} students enrolled</p>

            {/* Bulk add */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Add Multiple Students at Once</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>Type one student name per line, then click Add Students. You can add 10, 50, or 100+ students at once.</p>
              <textarea
                className="input-field"
                rows={6}
                placeholder={"Adaeze Okonkwo\nChukwuemeka Eze\nFatima Bello\nIbrahim Musa\n..."}
                value={bulkNames}
                onChange={e => setBulkNames(e.target.value)}
                style={{ resize: 'vertical', marginBottom: 12 }}
              />
              {addMsg && <div style={{ marginBottom: 12, fontSize: 13, color: addMsg.startsWith('✅') ? '#10b981' : '#ef4444' }}>{addMsg}</div>}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn-primary" onClick={bulkAddStudents} disabled={addingStudents || !bulkNames.trim()}>
                  <UserPlus size={15} />
                  {addingStudents ? 'Adding...' : `Add ${bulkNames.split('\n').filter(n => n.trim()).length} Students`}
                </button>
                {bulkNames && <span style={{ fontSize: 12, color: 'var(--text2)' }}>{bulkNames.split('\n').filter(n => n.trim()).length} names detected</span>}
              </div>
            </div>

            {/* Students table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 160px 70px 70px 80px 40px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <span>#</span><span>Name</span><span>Admission No.</span><span>Present</span><span>Absent</span><span>%</span><span></span>
              </div>
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {summary.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No students yet. Add some above!</div>
                ) : summary.map((s, i) => {
                  const color = s.percentage >= 75 ? '#10b981' : s.percentage >= 50 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 160px 70px 70px 80px 40px', padding: '11px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.admissionNo}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{s.present}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{s.absent}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{s.total > 0 ? `${s.percentage}%` : '—'}</span>
                      <button onClick={() => deleteStudent(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><Trash2 size={13} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {active === 'reports' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Reports</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>{classLabel} attendance analytics</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase' }}>Daily Attendance %</h3>
                {stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
                      <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                      <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>No data yet</div>}
              </div>
              <div className="card">
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase' }}>Present vs Absent</h3>
                {stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                      <Bar dataKey="present" fill="#10b981" name="Present" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>No data yet</div>}
              </div>
            </div>

            {/* All students breakdown */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase' }}>Student Breakdown</h3>
              {summary.map((s, i) => {
                const color = s.percentage >= 75 ? '#10b981' : s.percentage >= 50 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px 60px 160px', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{i + 1}</span>
                    <span style={{ fontSize: 13 }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: '#10b981' }}>{s.present}P</span>
                    <span style={{ fontSize: 12, color: '#ef4444' }}>{s.absent}A</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${s.percentage}%`, height: '100%', background: color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color, width: 38 }}>{s.total > 0 ? `${s.percentage}%` : '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EXPORT PDF ── */}
        {active === 'export' && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Export PDF Report</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Download attendance records for {classLabel}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Report Summary</h3>
                {[
                  { label: 'Class', value: classLabel },
                  { label: 'Teacher', value: teacher?.fullName },
                  { label: 'Total Students', value: students.length },
                  { label: 'Average Attendance', value: `${avgAttendance}%`, color: avgAttendance >= 75 ? '#10b981' : '#f59e0b' },
                  { label: 'Eligible (≥75%)', value: summary.filter(s => s.percentage >= 75).length, color: '#10b981' },
                  { label: 'At Risk (<75%)', value: summary.filter(s => s.percentage < 75 && s.total > 0).length, color: '#ef4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text2)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: color || 'var(--text)' }}>{value}</span>
                  </div>
                ))}

                <button className="btn-primary" onClick={exportPDF} style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: 14, fontSize: 15 }}>
                  <FileText size={17} /> Download PDF Report
                </button>
              </div>

              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Student List Preview</h3>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {summary.map((s, i) => {
                    const color = s.percentage >= 75 ? '#10b981' : s.percentage >= 50 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.admissionNo}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color }}>{s.total > 0 ? `${s.percentage}%` : '—'}</div>
                          <div style={{ fontSize: 10, color }}>{s.percentage >= 75 ? 'ELIGIBLE' : s.total === 0 ? 'NO DATA' : 'AT RISK'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

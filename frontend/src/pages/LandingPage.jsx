import React, { useState } from 'react';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

const CLASSES = [
  { id: 'JSS1', label: 'JSS 1', desc: 'Junior Secondary School 1', color: '#3b82f6' },
  { id: 'JSS2', label: 'JSS 2', desc: 'Junior Secondary School 2', color: '#6366f1' },
  { id: 'JSS3', label: 'JSS 3', desc: 'Junior Secondary School 3', color: '#8b5cf6' },
  { id: 'SSS1', label: 'SSS 1', desc: 'Senior Secondary School 1', color: '#10b981' },
  { id: 'SSS2', label: 'SSS 2', desc: 'Senior Secondary School 2', color: '#059669' },
  { id: 'SSS3', label: 'SSS 3', desc: 'Senior Secondary School 3', color: '#047857' },
];

export default function LandingPage({ onSelectClass }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(ellipse at top, #0f1e3a 0%, var(--bg) 60%)' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>AttendTrack</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>School Attendance Management</div>
          </div>
        </div>

        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.2, marginBottom: 16 }}>
          Select Your Class
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 440, margin: '0 auto' }}>
          Choose the class you teach to access your students' attendance records. You will need your login credentials to proceed.
        </p>
      </div>

      {/* Class Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 700, width: '100%', marginBottom: 48 }}>
        {CLASSES.map(cls => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls.id)}
            onMouseEnter={() => setHovered(cls.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === cls.id ? 'var(--surface2)' : 'var(--surface)',
              border: `1.5px solid ${hovered === cls.id ? cls.color : 'var(--border)'}`,
              borderRadius: 16,
              padding: '24px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              transform: hovered === cls.id ? 'translateY(-3px)' : 'none',
              boxShadow: hovered === cls.id ? `0 8px 25px ${cls.color}22` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cls.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color={cls.color} />
              </div>
              <ArrowRight size={16} color={hovered === cls.id ? cls.color : 'var(--text3)'} style={{ transition: 'color 0.2s' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{cls.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{cls.desc}</div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
        🔒 Access is restricted. Each teacher can only view their assigned class.
      </p>
    </div>
  );
}

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLASS_COLORS = { JSS1: '#3b82f6', JSS2: '#6366f1', JSS3: '#8b5cf6', SSS1: '#10b981', SSS2: '#059669', SSS3: '#047857' };

export default function LoginPage({ className, onBack }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const color = CLASS_COLORS[className] || '#3b82f6';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'radial-gradient(ellipse at top, #0f1e3a 0%, var(--bg) 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Back button */}
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--text2)', fontSize: 13, marginBottom: 32, cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back to classes
        </button>

        {/* Card */}
        <div className="card" style={{ padding: '40px 36px' }}>
          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: 18, background: `${color}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `2px solid ${color}44` }}>
              <GraduationCap size={30} color={color} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{className.replace('JSS', 'JSS ').replace('SSS', 'SSS ')} Teacher Login</h1>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>Enter your credentials to access your class</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, background: color }}>
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>
          🔒 Unauthorized access is prohibited. Teachers can only access their own class.
        </p>
      </div>
    </div>
  );
}

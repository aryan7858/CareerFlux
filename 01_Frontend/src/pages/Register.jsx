import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff, HiBriefcase } from 'react-icons/hi';

const roles = [
    { value: 'jobseeker', label: '👤 Job Seeker', desc: 'Looking for work' },
    { value: 'employer', label: '🏢 Employer', desc: 'Hiring talent' },
];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const payload = { ...form, firstName: form.name.split(' ')[0], lastName: form.name.split(' ').slice(1).join(' ') || '' };
            const userData = await register(payload);
            if (userData?.role === 'employer') {
                navigate('/login');
            } else {
                const map = { seeker: '/dashboard', jobseeker: '/dashboard', employer: '/employer/dashboard', admin: '/admin/dashboard' };
                navigate(map[userData?.role] || '/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '13px 14px 13px 42px', border: '1.5px solid var(--border)', borderRadius: 10,
        fontSize: '0.9rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.2s', background: 'var(--input-bg)'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Outfit, sans-serif', background: 'var(--bg)' }}>
            {/* Left Panel */}
            <div className="hidden md:flex" style={{ flex: 1, background: 'linear-gradient(160deg, #1f2937 0%, #374151 100%)', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', pointerEvents: 'none' }} />
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', justifyContent: 'center', marginBottom: 40 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiBriefcase style={{ color: '#fff', fontSize: 26 }} /></div>
                        <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>Career<span style={{ color: '#22c55e' }}>Flux</span></span>
                    </Link>
                    <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Your Dream Job is One Step Away</h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 340, fontSize: '0.95rem' }}>Join thousands of professionals who found their perfect role through CareerFlux.</p>
                    <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['✅ Free to join — no credit card needed', '🔒 Your data is encrypted & secure', '🚀 Apply to jobs with one click', '📊 Track all your applications'].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px', textAlign: 'left' }}>
                                <span style={{ fontSize: '1rem' }}>{item.split(' ')[0]}</span>
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>{item.split(' ').slice(1).join(' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 5%', background: 'var(--surface)', minHeight: '100vh' }}>
                <Link to="/" className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiBriefcase style={{ color: '#fff', fontSize: 18 }} /></div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>Career<span style={{ color: '#22c55e' }}>Flux</span></span>
                </Link>
                <div style={{ width: '100%', maxWidth: 420 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '1.9rem', color: 'var(--text)', marginBottom: 8 }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                        {roles.map(r => (
                            <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                                style={{ padding: '14px 10px', borderRadius: 10, border: `2px solid ${form.role === r.value ? '#22c55e' : 'var(--border)'}`, background: form.role === r.value ? 'var(--green-bg)' : 'var(--surface)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: 4 }}>{r.label.split(' ')[0]}</p>
                                <p style={{ fontWeight: 700, color: form.role === r.value ? '#16a34a' : 'var(--text)', fontSize: '0.85rem', marginBottom: 3 }}>{r.label.split(' ').slice(1).join(' ')}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.desc}</p>
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[{ icon: <HiUser />, name: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe' }, { icon: <HiMail />, name: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com' }].map(field => (
                            <div key={field.name}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{field.label}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none' }}>{field.icon}</span>
                                    <input name={field.name} type={field.type} placeholder={field.placeholder} value={form[field.name]} onChange={handleChange} required style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                            </div>
                        ))}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none' }}><HiLockClosed /></span>
                                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required style={{ ...inputStyle, paddingRight: 42 }}
                                    onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18 }}>
                                    {showPass ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-green" style={{ marginTop: 10, padding: '0.9rem', justifyContent: 'center', fontSize: '0.95rem', borderRadius: 10 }}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                        By signing up, you agree to our <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms</a> &amp; <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

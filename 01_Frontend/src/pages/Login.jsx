import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiBriefcase } from 'react-icons/hi';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(form.email, form.password);
            const map = { jobseeker: '/dashboard', seeker: '/dashboard', employer: '/employer/dashboard', admin: '/admin/dashboard' };
            navigate(map[userData?.role] || '/');
        } catch (err) {
            const data = err.response?.data;
            let msg = data?.message || 'Invalid credentials';
            if (data?.errors && data.errors.length > 0) {
                msg = data.errors[0].msg;
            }
            toast.error(msg);
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '13px 42px', border: '1.5px solid var(--border)', borderRadius: 10,
        fontSize: '0.9rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.2s', background: 'var(--input-bg)'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Outfit, sans-serif', background: 'var(--bg)' }}>
            {/* Left Panel */}
            <div style={{ flex: 1, background: 'linear-gradient(160deg, #22c55e 0%, #16a34a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative' }} className="hidden md:flex">
                <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>
                        <HiBriefcase style={{ color: '#fff' }} />
                    </div>
                    <h2 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Welcome Back to CareerFlux</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 340 }}>Thousands of jobs are waiting for you. Sign in and take the next step in your career journey.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 48 }}>
                        {[{ num: '13k+', label: 'Open Jobs' }, { num: '8k+', label: 'Companies' }, { num: '50k+', label: 'Job Seekers' }, { num: '95%', label: 'Success Rate' }].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                                <p style={{ fontWeight: 800, fontSize: '1.6rem', color: '#fff' }}>{s.num}</p>
                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', marginTop: 4 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 5%', background: 'var(--surface)', minHeight: '100vh' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }} className="md:hidden">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiBriefcase style={{ color: '#fff', fontSize: 18 }} /></div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>Career<span style={{ color: '#22c55e' }}>Flux</span></span>
                </Link>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '1.9rem', color: 'var(--text)', marginBottom: 8 }}>Sign In</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Email address</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none' }}><HiMail /></span>
                                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 18, pointerEvents: 'none' }}><HiLockClosed /></span>
                                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={handleChange} required style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18 }}>
                                    {showPass ? <HiEyeOff /> : <HiEye />}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <a href="#" style={{ color: '#22c55e', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
                        </div>
                        <button type="submit" disabled={loading} className="btn-green" style={{ marginTop: 8, padding: '0.85rem', justifyContent: 'center', fontSize: '0.95rem', borderRadius: 10 }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                        By signing in, you agree to our <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms</a> &amp; <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

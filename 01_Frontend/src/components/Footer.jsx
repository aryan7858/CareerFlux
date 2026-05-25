import { Link } from 'react-router-dom';
import { HiBriefcase } from 'react-icons/hi';

export default function Footer() {
    const col = (title, links) => (
        <div>
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.9rem' }}>{title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(({ to, label }) => (
                    <Link key={label} to={to} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.target.style.color = '#22c55e'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <footer style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', marginTop: 80, transition: 'background 0.2s' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 5% 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 7, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiBriefcase style={{ color: '#fff', fontSize: 16 }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>Career<span style={{ color: '#22c55e' }}>Flux</span></span>
                        </Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>The open job portal connecting talent with opportunity across every industry.</p>
                    </div>
                    {col('For Job Seekers', [
                        { to: '/jobs', label: 'Browse Jobs' }, { to: '/register', label: 'Create Account' },
                        { to: '/dashboard', label: 'My Applications' }, { to: '/profile', label: 'My Profile' },
                    ])}
                    {col('For Employers', [
                        { to: '/employer/post-job', label: 'Post a Job' },
                        { to: '/employer/dashboard', label: 'Employer Dashboard' },
                        { to: '/register', label: 'Sign Up as Employer' },
                    ])}
                    {col('Company', [
                        { to: '/', label: 'About Us' }, { to: '/', label: 'Contact' },
                        { to: '/', label: 'Privacy Policy' }, { to: '/', label: 'Terms of Service' },
                    ])}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>© 2025 CareerFlux. All rights reserved.</p>
                    <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>Built with ❤️ for job seekers everywhere</p>
                </div>
            </div>
        </footer>
    );
}

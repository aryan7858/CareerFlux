import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useState } from 'react';
import { HiMenu, HiX, HiBriefcase, HiMoon, HiSun, HiBell, HiCheckCircle } from 'react-icons/hi';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { dark, toggle } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };

    const getDashboardLink = () => {
        if (!user) return '/';
        const map = { jobseeker: '/dashboard', seeker: '/dashboard', employer: '/employer/dashboard', admin: '/admin/dashboard' };
        return map[user.role] || '/';
    };

    const navStyle = {
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        position: 'sticky', top: 0, zIndex: 50,
        transition: 'background 0.2s',
    };

    const linkStyle = (base = {}) => ({
        textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.15s', ...base
    });

    return (
        <nav style={navStyle}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 5%', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiBriefcase style={{ color: '#fff', fontSize: 18 }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                        Career<span style={{ color: '#22c55e' }}>Flux</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
                    {[{ to: '/', label: 'Home' }, { to: '/jobs', label: 'Find Jobs' }].map(({ to, label }) => (
                        <Link key={label} to={to} style={linkStyle()}
                            onMouseEnter={e => e.target.style.color = '#22c55e'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                            {label}
                        </Link>
                    ))}
                    {isAuthenticated && (
                        <Link to={getDashboardLink()} style={linkStyle()}
                            onMouseEnter={e => e.target.style.color = '#22c55e'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* Right Side Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Universal Dark Mode Toggle */}
                    <button
                        onClick={toggle}
                        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: dark ? '#1e293b' : '#f3f4f6',
                            border: `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: dark ? '#fbbf24' : '#6b7280', fontSize: 18,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#334155' : '#e5e7eb'; e.currentTarget.style.color = dark ? '#fbbf24' : '#6b7280'; }}>
                        {dark ? <HiSun /> : <HiMoon />}
                    </button>

                    {/* Notification Bell with Real-time count */}
                    {isAuthenticated && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                title="Notifications"
                                style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: 'transparent',
                                    border: '1.5px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--text)', fontSize: 20,
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <HiBell />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -4, right: -4,
                                        background: '#ef4444', color: '#fff',
                                        fontSize: '0.7rem', fontWeight: 700,
                                        width: 18, height: 18, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 0 0 2px var(--bg)'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {notifOpen && (
                                <>
                                    <div 
                                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                                        onClick={() => setNotifOpen(false)} 
                                    />
                                    <div className="animate-fade-in" style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                        width: '320px', background: 'var(--surface)',
                                        border: '1px solid var(--border)', borderRadius: '12px',
                                        boxShadow: 'var(--card-shadow)', zIndex: 100,
                                        display: 'flex', flexDirection: 'column',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            padding: '12px 16px', borderBottom: '1px solid var(--border)',
                                            background: 'var(--bg-subtle)', display: 'flex',
                                            justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
                                                Notifications
                                            </span>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    style={{
                                                        background: 'none', border: 'none',
                                                        color: '#22c55e', fontSize: '0.75rem',
                                                        fontWeight: 600, cursor: 'pointer'
                                                    }}
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '6px' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif._id}
                                                        onClick={() => {
                                                            markAsRead(notif._id);
                                                            setNotifOpen(false);
                                                            navigate(notif.link);
                                                        }}
                                                        style={{
                                                            padding: '10px 12px', borderRadius: '8px',
                                                            cursor: 'pointer', display: 'flex', gap: '10px',
                                                            background: notif.isRead ? 'transparent' : 'var(--green-bg)',
                                                            marginBottom: '4px', transition: 'all 0.15s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'var(--green-bg)'}
                                                    >
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            background: notif.isRead ? 'var(--surface-2)' : '#22c55e',
                                                            color: notif.isRead ? 'var(--text-muted)' : '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '1rem', flexShrink: 0
                                                        }}>
                                                            {notif.type === 'status_updated' ? '💼' : notif.type === 'reply_received' ? '💬' : '🔔'}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: notif.isRead ? 500 : 700, color: 'var(--text)', lineHeight: 1.2 }}>
                                                                {notif.title}
                                                            </p>
                                                            <p style={{ margin: '2px 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                                                {notif.message}
                                                            </p>
                                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                                                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', alignSelf: 'center', flexShrink: 0 }} />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Desktop CTA */}
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10, position: 'relative' }}>
                        {isAuthenticated ? (
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '30px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-bg)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                                        {(user?.firstName || user?.name || 'U')[0].toUpperCase()}
                                    </div>
                                    <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {user?.firstName || user?.name?.split(' ')[0]}
                                        {user?.isVerified && (
                                            <HiCheckCircle style={{ color: '#3b82f6', fontSize: 16 }} title="Verified Profile" />
                                        )}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <>
                                        {/* Invisible overlay to catch clicks outside */}
                                        <div 
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                                            onClick={() => setDropdownOpen(false)} 
                                        />
                                        <div className="animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--card-shadow)', zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user?.firstName || user?.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                                            </div>
                                            <div style={{ padding: '6px' }}>
                                                <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem', borderRadius: '6px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = 'var(--bg-subtle)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                                    Dashboard
                                                </Link>
                                                <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem', borderRadius: '6px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = 'var(--bg-subtle)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                                    Edit Profile
                                                </Link>
                                                <button onClick={() => { handleLogout(); setDropdownOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = 'var(--bg-subtle)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" style={{ ...linkStyle({ padding: '0.5rem 1.1rem', borderRadius: 8, border: `1.5px solid var(--border)`, color: 'var(--text)' }) }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>
                                    Login / Sign up
                                </Link>
                                <Link to="/employer/post-job" className="btn-green" style={{ textDecoration: 'none', padding: '0.5rem 1.2rem' }}>
                                    Post a Job
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: Hamburger menu */}
                    <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 24 }}>
                        {mobileOpen ? <HiX /> : <HiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden animate-fade-in" style={{ background: 'var(--nav-bg)', borderTop: `1px solid var(--nav-border)`, padding: '16px 5%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[{ to: '/', label: 'Home' }, { to: '/jobs', label: 'Find Jobs' }].map(({ to, label }) => (
                        <Link key={label} to={to} onClick={() => setMobileOpen(false)} style={linkStyle({ color: 'var(--text)', fontWeight: 500 })}>{label}</Link>
                    ))}
                    {isAuthenticated && (
                        <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} style={linkStyle({ color: 'var(--text)', fontWeight: 500 })}>Dashboard</Link>
                    )}
                    {isAuthenticated ? (
                        <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}>
                            Logout
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link to="/login" onClick={() => setMobileOpen(false)} style={{ ...linkStyle({ border: `1.5px solid var(--border)`, borderRadius: 8, padding: '8px 14px', color: 'var(--text)' }) }}>Login</Link>
                            <Link to="/employer/post-job" onClick={() => setMobileOpen(false)} className="btn-green" style={{ textDecoration: 'none', padding: '8px 14px' }}>Post a Job</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

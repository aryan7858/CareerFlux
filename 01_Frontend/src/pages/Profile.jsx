import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import {
    HiUser, HiMail, HiPhone, HiLocationMarker, HiPencil, HiSave,
    HiBriefcase, HiLink, HiCode, HiOfficeBuilding, HiCheck,
    HiX, HiPlus,
} from 'react-icons/hi';

// ── Reusable Input with floating label support ──────────────────
function Input({ label, icon, value, onChange, type = 'text', placeholder = '', rows }) {
    const [focused, setFocused] = useState(false);
    const baseStyle = {
        width: '100%', border: '1.5px solid', borderColor: focused ? '#22c55e' : 'var(--border)',
        borderRadius: 10, fontSize: '0.875rem', color: 'var(--text)',
        outline: 'none', fontFamily: 'inherit', background: 'var(--input-bg)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
        ...(icon ? { paddingLeft: 42 } : { paddingLeft: 14 }),
        paddingRight: 14, padding: `13px ${icon ? '14px 13px 42px' : '14px'}`,
    };
    return (
        <div>
            {label && <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>}
            <div style={{ position: 'relative' }}>
                {icon && <span style={{ position: 'absolute', left: 14, top: rows ? 14 : '50%', transform: rows ? 'none' : 'translateY(-50%)', color: focused ? '#22c55e' : 'var(--text-faint)', fontSize: 17, pointerEvents: 'none', transition: 'color 0.2s' }}>{icon}</span>}
                {rows ? (
                    <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
                        style={{ ...baseStyle, paddingTop: 13, paddingBottom: 13, resize: 'vertical', lineHeight: 1.6 }}
                        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                ) : (
                    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                        style={{ ...baseStyle, paddingTop: 13, paddingBottom: 13 }}
                        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                )}
            </div>
        </div>
    );
}

// ── Avatar with initials ──────────────────────────────────────────
function Avatar({ name, size = 80 }) {
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.32, color: '#fff', flexShrink: 0, boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
            {initials}
        </div>
    );
}

// ── Skills chips component (add/remove) ──────────────────────
function SkillsInput({ value, onChange }) {
    const [input, setInput] = useState('');
    const skills = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    const add = () => {
        const trimmed = input.trim();
        if (!trimmed || skills.includes(trimmed)) return;
        onChange(skills.concat(trimmed).join(', '));
        setInput('');
    };
    const remove = (skill) => onChange(skills.filter(s => s !== skill).join(', '));

    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Skills</label>
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', background: 'var(--input-bg)', display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 48 }}>
                {skills.map(skill => (
                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: '#22c55e', padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>
                        {skill}
                        <button type="button" onClick={() => remove(skill)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: 0, fontSize: 13 }}><HiX /></button>
                    </span>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 120 }}>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                        placeholder="Add a skill..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.83rem', color: 'var(--text)', fontFamily: 'inherit', flex: 1 }} />
                    <button type="button" onClick={add} style={{ background: '#22c55e', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}><HiPlus /></button>
                </div>
            </div>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.73rem', marginTop: 5 }}>Press Enter or + to add a skill</p>
        </div>
    );
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ title, icon, children }) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#22c55e', fontSize: 18 }}>{icon}</span>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{title}</h3>
            </div>
            <div style={{ padding: 22 }}>{children}</div>
        </div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState('personal');

    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        location: user?.location || '',
        phone: user?.phone || '',
        skills: user?.skills?.join(', ') || '',
        linkedIn: user?.linkedIn || '',
        github: user?.github || '',
        portfolio: user?.portfolio || '',
        companyName: user?.companyName || '',
        companyWebsite: user?.companyWebsite || '',
        companySize: user?.companySize || '',
        industry: user?.industry || '',
        companyDescription: user?.companyDescription || '',
    });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
    const setVal = (key) => (val) => setForm({ ...form, [key]: val });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.updateProfile({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) });
            await refreshUser();
            toast.success('Profile updated! ✅');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    const fullName = `${form.firstName} ${form.lastName}`.trim() || user?.email?.split('@')[0] || 'User';
    const profilePct = Math.round(
        ([form.firstName, form.headline, form.bio, form.location, form.phone, form.skills, form.linkedIn].filter(Boolean).length / 7) * 100
    );

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: <HiUser /> },
        { id: 'social', label: 'Social Links', icon: <HiLink /> },
        ...(user?.role === 'jobseeker' || user?.role === 'seeker' ? [{ id: 'skills', label: 'Skills', icon: <HiCode /> }] : []),
        ...(user?.role === 'employer' ? [{ id: 'company', label: 'Company', icon: <HiOfficeBuilding /> }] : []),
    ];

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s' }}>
            <Navbar />

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 5% 80px' }}>

                {/* Profile Header Card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 28px', marginBottom: 24, boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative gradient bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: 'linear-gradient(90deg, #22c55e, #16a34a, #4ade80)' }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                        <Avatar name={fullName} size={80} />
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text)', marginBottom: 4 }}>{fullName}</h1>
                            {form.headline && <p style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>{form.headline}</p>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                {user?.email && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.82rem' }}><HiMail /> {user.email}</span>}
                                {form.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.82rem' }}><HiLocationMarker /> {form.location}</span>}
                                {form.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.82rem' }}><HiPhone /> {form.phone}</span>}
                            </div>
                        </div>
                        {/* Profile strength */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                            <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border)" strokeWidth="5" />
                                    <circle cx="32" cy="32" r="26" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray={`${2 * Math.PI * 26 * profilePct / 100} ${2 * Math.PI * 26}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)' }}>{profilePct}%</div>
                            </div>
                            <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem', fontWeight: 500 }}>Complete</span>
                        </div>
                    </div>

                    {/* Skills preview */}
                    {form.skills && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                            {form.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8).map(skill => (
                                <span key={skill} style={{ background: 'var(--tag-bg)', color: 'var(--tag-color)', border: '1px solid var(--border)', padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500 }}>{skill}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 20, overflowX: 'auto' }}>
                    {tabs.map(t => (
                        <button key={t.id} type="button" onClick={() => setTab(t.id)}
                            style={{
                                flex: 1, minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.83rem', transition: 'all 0.15s', whiteSpace: 'nowrap',
                                background: tab === t.id ? '#22c55e' : 'transparent',
                                color: tab === t.id ? '#fff' : 'var(--text-muted)',
                            }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Form sections */}
                <form onSubmit={handleSubmit}>
                    {tab === 'personal' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Section title="Basic Information" icon={<HiUser />}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <Input label="First Name" icon={<HiUser />} value={form.firstName} onChange={set('firstName')} placeholder="John" />
                                    <Input label="Last Name" icon={<HiUser />} value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
                                </div>
                                <div style={{ height: 14 }} />
                                <Input label="Professional Headline" icon={<HiBriefcase />} value={form.headline} onChange={set('headline')} placeholder="e.g. Senior Full Stack Developer" />
                                <div style={{ height: 14 }} />
                                <Input label="Bio" icon={<HiPencil />} value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself..." rows={3} />
                            </Section>

                            <Section title="Contact Details" icon={<HiPhone />}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <Input label="Location" icon={<HiLocationMarker />} value={form.location} onChange={set('location')} placeholder="City, Country" />
                                    <Input label="Phone" icon={<HiPhone />} value={form.phone} onChange={set('phone')} type="tel" placeholder="+1 234 567 890" />
                                </div>
                            </Section>
                        </div>
                    )}

                    {tab === 'social' && (
                        <Section title="Social & Portfolio Links" icon={<HiLink />}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <Input label="LinkedIn" icon={<HiLink />} value={form.linkedIn} onChange={set('linkedIn')} type="url" placeholder="https://linkedin.com/in/..." />
                                <Input label="GitHub" icon={<HiCode />} value={form.github} onChange={set('github')} type="url" placeholder="https://github.com/..." />
                                <Input label="Portfolio Website" icon={<HiLink />} value={form.portfolio} onChange={set('portfolio')} type="url" placeholder="https://yoursite.com" />
                            </div>
                            {/* Preview badges */}
                            {(form.linkedIn || form.github || form.portfolio) && (
                                <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Preview</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {[form.linkedIn && { label: 'LinkedIn', color: '#0077b5' }, form.github && { label: 'GitHub', color: '#333' }, form.portfolio && { label: 'Portfolio', color: '#22c55e' }].filter(Boolean).map(item => (
                                            <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, background: item.color, color: '#fff', fontSize: '0.78rem', fontWeight: 600 }}>
                                                <HiLink /> {item.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Section>
                    )}

                    {tab === 'skills' && (
                        <Section title="Skills & Expertise" icon={<HiCode />}>
                            <SkillsInput value={form.skills} onChange={setVal('skills')} />
                            {form.skills && (
                                <div style={{ marginTop: 20 }}>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Your skills ({form.skills.split(',').filter(Boolean).length})</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {form.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                                            <span key={skill} style={{ background: ['var(--stat-blue-bg)', 'var(--stat-grn-bg)', 'var(--stat-amb-bg)', 'var(--stat-pur-bg)'][i % 4], color: ['var(--stat-blue-cl)', 'var(--stat-grn-cl)', 'var(--stat-amb-cl)', 'var(--stat-pur-cl)'][i % 4], padding: '6px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Section>
                    )}

                    {tab === 'company' && (
                        <Section title="Company Details" icon={<HiOfficeBuilding />}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <Input label="Company Name" icon={<HiOfficeBuilding />} value={form.companyName} onChange={set('companyName')} placeholder="Acme Corp" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <Input label="Website" icon={<HiLink />} value={form.companyWebsite} onChange={set('companyWebsite')} type="url" placeholder="https://company.com" />
                                    <Input label="Industry" icon={<HiBriefcase />} value={form.industry} onChange={set('industry')} placeholder="Technology" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Company Size</label>
                                    <select value={form.companySize} onChange={set('companySize')}
                                        style={{ width: '100%', padding: '13px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.875rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', background: 'var(--input-bg)', cursor: 'pointer' }}>
                                        <option value="">Select size</option>
                                        {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(s => <option key={s} value={s}>{s} employees</option>)}
                                    </select>
                                </div>
                                <Input label="Company Description" value={form.companyDescription} onChange={set('companyDescription')} placeholder="About your company..." rows={4} />
                            </div>
                        </Section>
                    )}

                    {/* Save button */}
                    <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => window.history.back()}
                            style={{ padding: '0.75rem 1.6rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-green" style={{ padding: '0.75rem 2rem', fontWeight: 700 }}>
                            {loading ? 'Saving...' : <><HiSave /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}

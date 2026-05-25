import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
    HiArrowLeft, HiBriefcase, HiAcademicCap, HiMail, HiPhone,
    HiLocationMarker, HiLink, HiPlus, HiTrash, HiSave, HiDownload,
    HiTemplate, HiChevronRight
} from 'react-icons/hi';

export default function ResumeBuilder() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState('modern'); // 'modern', 'minimal', 'creative'

    // Form states pre-filled with user profile data
    const [personalInfo, setPersonalInfo] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        linkedIn: user?.linkedIn || '',
        github: user?.github || '',
        portfolio: user?.portfolio || '',
    });

    const [experiences, setExperiences] = useState(user?.experience || []);
    const [educations, setEducations] = useState(user?.education || []);
    const [skills, setSkills] = useState(user?.skills || []);
    const [skillInput, setSkillInput] = useState('');

    // Handle personal info change
    const handlePersonalChange = (key, val) => {
        setPersonalInfo(prev => ({ ...prev, [key]: val }));
    };

    // Experience Management
    const addExperience = () => {
        setExperiences(prev => [...prev, {
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }]);
    };

    const updateExperience = (idx, key, val) => {
        setExperiences(prev => prev.map((exp, i) => i === idx ? { ...exp, [key]: val } : exp));
    };

    const removeExperience = (idx) => {
        setExperiences(prev => prev.filter((_, i) => i !== idx));
    };

    // Education Management
    const addEducation = () => {
        setEducations(prev => [...prev, {
            degree: '',
            institution: '',
            field: '',
            startYear: new Date().getFullYear() - 4,
            endYear: new Date().getFullYear()
        }]);
    };

    const updateEducation = (idx, key, val) => {
        setEducations(prev => prev.map((edu, i) => i === idx ? { ...edu, [key]: val } : edu));
    };

    const removeEducation = (idx) => {
        setEducations(prev => prev.filter((_, i) => i !== idx));
    };

    // Skills Management
    const addSkill = (e) => {
        if (e) e.preventDefault();
        const trimmed = skillInput.trim();
        if (!trimmed) return;
        if (skills.includes(trimmed)) {
            setSkillInput('');
            return;
        }
        setSkills(prev => [...prev, trimmed]);
        setSkillInput('');
    };

    const removeSkill = (skill) => {
        setSkills(prev => prev.filter(s => s !== skill));
    };

    // Save Resume Data back to User Profile
    const saveToProfile = async () => {
        setLoading(true);
        try {
            const updatePayload = {
                ...personalInfo,
                experience: experiences,
                education: educations,
                skills: skills
            };
            await authAPI.updateProfile(updatePayload);
            await refreshUser();
            toast.success('Resume details synced & saved to profile! 💾');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to sync to profile.');
        } finally {
            setLoading(false);
        }
    };

    // Download PDF (Browser Print native modal)
    const downloadPdf = () => {
        window.print();
    };

    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name';

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            {/* Print Styles injection */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* Hide everything except the resume container */
                    body * {
                        visibility: hidden !important;
                    }
                    .resume-print-area, .resume-print-area * {
                        visibility: visible !important;
                    }
                    .resume-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: #ffffff !important;
                        color: #1f2937 !important;
                        padding: 20mm !important;
                        margin: 0 !important;
                        transform: none !important;
                    }
                    header, nav, aside, button, .no-print {
                        display: none !important;
                        height: 0 !important;
                        width: 0 !important;
                        overflow: hidden !important;
                    }
                    /* Reset colors for printing */
                    .creative-sidebar-col {
                        background: #f3f4f6 !important;
                        color: #1f2937 !important;
                        border-right: 1px solid #e5e7eb !important;
                    }
                    .print-text-dark {
                        color: #1f2937 !important;
                    }
                }
            `}} />

            <div className="no-print" style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '20px 5%' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                            <HiArrowLeft /> Back to Dashboard
                        </Link>
                        <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', margin: 0 }}>Integrated Resume Builder</h1>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 4 }}>
                            {['modern', 'minimal', 'creative'].map(t => (
                                <button key={t} onClick={() => setTemplate(t)}
                                    style={{
                                        padding: '6px 12px', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s',
                                        background: template === t ? '#22c55e' : 'transparent',
                                        color: template === t ? '#fff' : 'var(--text-muted)'
                                    }}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        
                        <button onClick={saveToProfile} disabled={loading} className="btn-ghost" style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <HiSave /> {loading ? 'Syncing...' : 'Save to Profile'}
                        </button>
                        
                        <button onClick={downloadPdf} className="btn-green" style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <HiDownload /> Download PDF
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 0, overflow: 'hidden' }} className="md-grid-1 no-print">
                
                {/* ── LEFT PANEL: FORMS ────────────────────────────────────────── */}
                <div style={{ height: 'calc(100vh - 150px)', overflowY: 'auto', padding: '32px 5%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Personal Info */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>First Name</label>
                                <input value={personalInfo.firstName} onChange={e => handlePersonalChange('firstName', e.target.value)} className="input-light" placeholder="John" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Last Name</label>
                                <input value={personalInfo.lastName} onChange={e => handlePersonalChange('lastName', e.target.value)} className="input-light" placeholder="Doe" />
                            </div>
                        </div>
                        <div style={{ height: 14 }} />
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Professional Headline</label>
                            <input value={personalInfo.headline} onChange={e => handlePersonalChange('headline', e.target.value)} className="input-light" placeholder="e.g. Senior Software Engineer" />
                        </div>
                        <div style={{ height: 14 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Email</label>
                                <input type="email" value={personalInfo.email} onChange={e => handlePersonalChange('email', e.target.value)} className="input-light" placeholder="john.doe@email.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Phone</label>
                                <input type="tel" value={personalInfo.phone} onChange={e => handlePersonalChange('phone', e.target.value)} className="input-light" placeholder="+1 234 567 890" />
                            </div>
                        </div>
                        <div style={{ height: 14 }} />
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Location</label>
                            <input value={personalInfo.location} onChange={e => handlePersonalChange('location', e.target.value)} className="input-light" placeholder="e.g. San Francisco, CA" />
                        </div>
                        <div style={{ height: 14 }} />
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Professional Summary / Bio</label>
                            <textarea value={personalInfo.bio} onChange={e => handlePersonalChange('bio', e.target.value)} rows={4} className="input-light" placeholder="Write a short summary..." style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ height: 14 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Portfolio Link</label>
                                <input value={personalInfo.portfolio} onChange={e => handlePersonalChange('portfolio', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.8rem' }} placeholder="https://..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>LinkedIn Link</label>
                                <input value={personalInfo.linkedIn} onChange={e => handlePersonalChange('linkedIn', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.8rem' }} placeholder="https://..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>GitHub Link</label>
                                <input value={personalInfo.github} onChange={e => handlePersonalChange('github', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.8rem' }} placeholder="https://..." />
                            </div>
                        </div>
                    </div>

                    {/* Experience section */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', margin: 0 }}>Work Experience</h3>
                            <button onClick={addExperience} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                                <HiPlus /> Add Work
                            </button>
                        </div>

                        {experiences.length === 0 ? (
                            <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>No experience listed. Click 'Add Work' to begin.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {experiences.map((exp, idx) => (
                                    <div key={idx} style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)', position: 'relative' }}>
                                        <button onClick={() => removeExperience(idx)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', fontSize: 16 }} title="Delete item">
                                            <HiTrash />
                                        </button>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Job Title</label>
                                                <input value={exp.title} onChange={e => updateExperience(idx, 'title', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="e.g. Software Engineer" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Company Name</label>
                                                <input value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="e.g. Google" />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Location</label>
                                                <input value={exp.location} onChange={e => updateExperience(idx, 'location', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="Remote / NY" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Start Date</label>
                                                <input type="date" value={exp.startDate ? exp.startDate.split('T')[0] : ''} onChange={e => updateExperience(idx, 'startDate', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>End Date</label>
                                                <input type="date" disabled={exp.current} value={exp.endDate && !exp.current ? exp.endDate.split('T')[0] : ''} onChange={e => updateExperience(idx, 'endDate', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} />
                                            </div>
                                        </div>

                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 10 }}>
                                            <input type="checkbox" checked={exp.current} onChange={e => updateExperience(idx, 'current', e.target.checked)} style={{ accentColor: '#22c55e' }} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>I currently work here</span>
                                        </label>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Description / Responsibilities</label>
                                            <textarea value={exp.description} onChange={e => updateExperience(idx, 'description', e.target.value)} rows={3} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem', resize: 'vertical' }} placeholder="Designed microservices using Node.js..." />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Education section */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', margin: 0 }}>Education</h3>
                            <button onClick={addEducation} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                                <HiPlus /> Add Education
                            </button>
                        </div>

                        {educations.length === 0 ? (
                            <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>No education listed. Click 'Add Education' to begin.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {educations.map((edu, idx) => (
                                    <div key={idx} style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)', position: 'relative' }}>
                                        <button onClick={() => removeEducation(idx)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', fontSize: 16 }} title="Delete item">
                                            <HiTrash />
                                        </button>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Institution Name</label>
                                                <input value={edu.institution} onChange={e => updateEducation(idx, 'institution', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="e.g. Stanford University" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Degree</label>
                                                <input value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="e.g. Bachelor of Science" />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Field of Study</label>
                                                <input value={edu.field} onChange={e => updateEducation(idx, 'field', e.target.value)} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="e.g. Computer Science" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Start Year</label>
                                                <input type="number" value={edu.startYear || ''} onChange={e => updateEducation(idx, 'startYear', parseInt(e.target.value))} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="YYYY" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>End Year</label>
                                                <input type="number" value={edu.endYear || ''} onChange={e => updateEducation(idx, 'endYear', parseInt(e.target.value))} className="input-light" style={{ padding: '8px 12px', fontSize: '0.82rem' }} placeholder="YYYY" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Skills section */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: 'var(--card-shadow)', marginBottom: 12 }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>Skills</h3>
                        
                        <form onSubmit={addSkill} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="input-light" style={{ padding: '9px 12px', fontSize: '0.85rem' }} placeholder="Add skill (e.g. React)..." />
                            <button type="submit" className="btn-green" style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}><HiPlus /></button>
                        </form>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {skills.length === 0 ? (
                                <span style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>No skills listed yet.</span>
                            ) : (
                                skills.map(skill => (
                                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--tag-bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', fontSize: 13 }}><HiTrash style={{ fontSize: 11 }} /></button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: LIVE PREVIEW ────────────────────────────────── */}
                <div style={{ height: 'calc(100vh - 150px)', overflowY: 'auto', padding: '32px 5%', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'center' }}>
                    <div className="resume-print-area" style={{
                        width: '210mm', height: 'fit-content', minHeight: '297mm', background: '#ffffff', color: '#1f2937', padding: '24px 20px', borderRadius: 4,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', fontFamily: 'Outfit, sans-serif', overflow: 'hidden'
                    }}>
                        {/* ── LAYOUT 1: MODERN ────────────────────────────────────────── */}
                        {template === 'modern' && (
                            <div>
                                {/* Header */}
                                <div style={{ borderBottom: '2.5px solid #22c55e', paddingBottom: 16, marginBottom: 20 }}>
                                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#111827', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>{fullName}</h2>
                                    {personalInfo.headline && <p style={{ color: '#22c55e', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{personalInfo.headline}</p>}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', fontSize: '0.8rem', color: '#4b5563', fontWeight: 500 }}>
                                        {personalInfo.email && <span>📧 {personalInfo.email}</span>}
                                        {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                                        {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                                        {personalInfo.portfolio && <span>🔗 {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>}
                                    </div>
                                </div>

                                {/* Summary */}
                                {personalInfo.bio && (
                                    <div style={{ marginBottom: 20 }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', paddingBottom: 4, marginBottom: 8 }}>Professional Summary</h3>
                                        <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>{personalInfo.bio}</p>
                                    </div>
                                )}

                                {/* Experience */}
                                {experiences.length > 0 && (
                                    <div style={{ marginBottom: 20 }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', paddingBottom: 4, marginBottom: 12 }}>Experience</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {experiences.map((exp, idx) => (
                                                <div key={idx}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: 0 }}>{exp.title} · <span style={{ color: '#22c55e' }}>{exp.company}</span></h4>
                                                        <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
                                                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''} – {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''}
                                                        </span>
                                                    </div>
                                                    {exp.location && <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 6px 0', fontStyle: 'italic' }}>{exp.location}</p>}
                                                    {exp.description && <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>{exp.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {educations.length > 0 && (
                                    <div style={{ marginBottom: 20 }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', paddingBottom: 4, marginBottom: 12 }}>Education</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {educations.map((edu, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0 }}>{edu.degree} in {edu.field}</h4>
                                                        <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0 }}>{edu.institution}</p>
                                                    </div>
                                                    <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{edu.startYear} – {edu.endYear}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                {skills.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', paddingBottom: 4, marginBottom: 10 }}>Skills</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {skills.map(skill => (
                                                <span key={skill} style={{ border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── LAYOUT 2: MINIMAL ────────────────────────────────────────── */}
                        {template === 'minimal' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* Header */}
                                <div style={{ textAlign: 'center', borderBottom: '1px solid #d1d5db', width: '100%', paddingBottom: 14, marginBottom: 18 }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 300, margin: '0 0 4px 0', color: '#111827', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{fullName}</h2>
                                    {personalInfo.headline && <p style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{personalInfo.headline}</p>}
                                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px', fontSize: '0.78rem', color: '#6b7280' }}>
                                        {personalInfo.email && <span>{personalInfo.email}</span>}
                                        {personalInfo.phone && <span>· &nbsp; {personalInfo.phone}</span>}
                                        {personalInfo.location && <span>· &nbsp; {personalInfo.location}</span>}
                                        {personalInfo.portfolio && <span>· &nbsp; {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>}
                                    </div>
                                </div>

                                {/* Content sections full-width */}
                                <div style={{ width: '100%' }}>
                                    {/* Summary */}
                                    {personalInfo.bio && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Profile</h3>
                                            <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#4b5563', margin: 0, whiteSpace: 'pre-line' }}>{personalInfo.bio}</p>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {experiences.length > 0 && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Experience</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                                {experiences.map((exp, idx) => (
                                                    <div key={idx}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', margin: 0 }}>{exp.title} &nbsp;|&nbsp; <span style={{ fontWeight: 500 }}>{exp.company}</span></h4>
                                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                                {exp.startDate ? new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''} – {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''}
                                                            </span>
                                                        </div>
                                                        {exp.location && <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '1px 0 4px 0' }}>{exp.location}</p>}
                                                        {exp.description && <p style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#4b5563', margin: 0, whiteSpace: 'pre-line' }}>{exp.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {educations.length > 0 && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Education</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {educations.map((edu, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                        <div>
                                                            <h4 style={{ fontSize: '0.83rem', fontWeight: 700, color: '#111827', margin: 0 }}>{edu.degree} &nbsp;|&nbsp; <span style={{ fontWeight: 500 }}>{edu.field}</span></h4>
                                                            <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0 }}>{edu.institution}</p>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{edu.startYear} – {edu.endYear}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Skills</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                                                {skills.join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── LAYOUT 3: CREATIVE ────────────────────────────────────────── */}
                        {template === 'creative' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 20, margin: '-24px -20px', minHeight: '297mm' }}>
                                {/* Left Column: Sidebar */}
                                <div className="creative-sidebar-col" style={{ background: '#1f2937', color: '#f3f4f6', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {/* Contact Details */}
                                    <div>
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #374151', paddingBottom: 4, marginBottom: 8 }}>Contact</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                            {personalInfo.email && <p style={{ margin: 0 }}>✉️ {personalInfo.email}</p>}
                                            {personalInfo.phone && <p style={{ margin: 0 }}>📞 {personalInfo.phone}</p>}
                                            {personalInfo.location && <p style={{ margin: 0 }}>📍 {personalInfo.location}</p>}
                                        </div>
                                    </div>

                                    {/* Links */}
                                    {(personalInfo.portfolio || personalInfo.linkedIn || personalInfo.github) && (
                                        <div>
                                            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #374151', paddingBottom: 4, marginBottom: 8 }}>Socials</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem' }}>
                                                {personalInfo.portfolio && <p style={{ margin: 0 }}>🔗 <a href={personalInfo.portfolio} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>Portfolio</a></p>}
                                                {personalInfo.linkedIn && <p style={{ margin: 0 }}>🔗 <a href={personalInfo.linkedIn} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>LinkedIn</a></p>}
                                                {personalInfo.github && <p style={{ margin: 0 }}>💻 <a href={personalInfo.github} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>GitHub</a></p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #374151', paddingBottom: 4, marginBottom: 10 }}>Skills</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                {skills.map(skill => (
                                                    <span key={skill} style={{ background: '#374151', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600 }}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Main Content */}
                                <div style={{ padding: '24px 20px 24px 0' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#111827', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>{fullName}</h2>
                                    {personalInfo.headline && <p style={{ color: '#10b981', fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{personalInfo.headline}</p>}

                                    {/* Summary */}
                                    {personalInfo.bio && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #10b981', paddingBottom: 4, marginBottom: 8 }}>About Me</h3>
                                            <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>{personalInfo.bio}</p>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {experiences.length > 0 && (
                                        <div style={{ marginBottom: 18 }}>
                                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #10b981', paddingBottom: 4, marginBottom: 10 }}>Experience</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                                {experiences.map((exp, idx) => (
                                                    <div key={idx}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', margin: 0 }}>{exp.title} · <span style={{ color: '#10b981' }}>{exp.company}</span></h4>
                                                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                                                                {exp.startDate ? new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''} – {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''}
                                                            </span>
                                                        </div>
                                                        {exp.location && <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '1px 0 4px 0', fontStyle: 'italic' }}>{exp.location}</p>}
                                                        {exp.description && <p style={{ fontSize: '0.78rem', lineHeight: 1.45, color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>{exp.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {educations.length > 0 && (
                                        <div>
                                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #10b981', paddingBottom: 4, marginBottom: 10 }}>Education</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {educations.map((edu, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                        <div>
                                                            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', margin: 0 }}>{edu.degree} in {edu.field}</h4>
                                                            <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0 }}>{edu.institution}</p>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{edu.startYear} – {edu.endYear}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

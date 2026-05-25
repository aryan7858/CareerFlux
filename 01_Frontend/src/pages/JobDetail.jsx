import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { HiLocationMarker, HiClock, HiCurrencyDollar, HiOfficeBuilding, HiBriefcase, HiArrowLeft, HiUsers, HiLightningBolt } from 'react-icons/hi';

const typeColors = {
    'full-time': { bg: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' },
    'part-time': { bg: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)' },
    'remote': { bg: 'var(--stat-grn-bg)', color: 'var(--stat-grn-cl)' },
    'contract': { bg: 'var(--stat-pur-bg)', color: 'var(--stat-pur-cl)' },
    'internship': { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
};

function CompanyLogoLarge({ name }) {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
    return (
        <div style={{ width: 80, height: 80, borderRadius: 16, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '2.5rem' }}>{name?.[0]?.toUpperCase() || '?'}</span>
        </div>
    );
}

export default function JobDetail() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await jobsAPI.getById(id);
                setJob(res.data.job);
                // Check if already applied (can be enhanced if backend returns applied status)
            } catch { toast.error('Job not found'); navigate('/jobs'); }
            finally { setLoading(false); }
        })();
    }, [id, navigate]);

    const handleApply = async () => {
        if (!isAuthenticated) { toast.error('Please login to apply'); return navigate('/login'); }
        setApplying(true);
        try {
            await applicationsAPI.apply({ jobId: id, coverLetter });
            toast.success('Application submitted successfully! 🎉');
            setApplied(true);
            setShowApplyForm(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
        finally { setApplying(false); }
    };

    if (loading) return <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh' }}><Navbar /><div className="pt-24 flex justify-center"><Loader /></div></div>;
    if (!job) return null;

    const salary = job.salary?.min && job.salary?.max
        ? `$${job.salary.min.toLocaleString()} — $${job.salary.max.toLocaleString()}`
        : 'Competitive';

    const typeStyle = typeColors[job.type] || { bg: 'var(--tag-bg)', color: 'var(--tag-color)' };

    return (
        <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Navbar />
            
            <div style={{ padding: '120px 5% 80px', maxWidth: 1100, margin: '0 auto' }}>
                <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: 24, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <HiArrowLeft /> Back to Jobs
                </Link>

                {/* ── JOB HEADER ─────────────────────────────────────────────── */}
                <div className="animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, marginBottom: 32, boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <CompanyLogoLarge name={job.company?.name || job.company} />
                            <div>
                                <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--text)', lineHeight: 1.2, marginBottom: 8 }}>{job.title}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--green)' }}>{job.company?.name || job.company}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}><HiLocationMarker /> {job.location}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}><HiClock /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 flex-shrink-0">
                            {user?.role === 'employer' ? (
                                <span style={{ background: 'var(--bg-subtle)', padding: '12px 24px', borderRadius: 12, color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border)', textAlign: 'center' }}>Employers cannot apply</span>
                            ) : applied ? (
                                <span style={{ background: 'var(--green-bg)', color: '#16a34a', padding: '12px 24px', borderRadius: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--green-border)', justifyContent: 'center' }}>✓ Application Submitted</span>
                            ) : (
                                <button onClick={() => setShowApplyForm(!showApplyForm)} className="btn-green" style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: 12, boxShadow: '0 8px 24px rgba(34,197,94,0.25)' }}>
                                    <HiLightningBolt /> Apply Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── APPLY FORM ─────────────────────────────────────────────── */}
                {showApplyForm && (
                    <div className="animate-fade-in-delay" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 32, boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 16 }}>Submit Your Application</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>Include a short message or cover letter to stand out to the employer.</p>
                        <textarea 
                            value={coverLetter} 
                            onChange={(e) => setCoverLetter(e.target.value)} 
                            rows={5} 
                            placeholder="I am excited to apply for this role because..." 
                            className="input-light"
                            style={{ resize: 'vertical', minHeight: 120 }}
                        />
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button onClick={handleApply} disabled={applying} className="btn-green" style={{ padding: '12px 28px' }}>{applying ? 'Submitting...' : 'Submit Application'}</button>
                            <button onClick={() => setShowApplyForm(false)} className="btn-ghost" style={{ padding: '12px 28px' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* ── MAIN CONTENT GRID ───────────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }} className="md-grid-1">
                    
                    {/* Left Column - Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div className="animate-fade-in-delay" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, boxShadow: 'var(--card-shadow)' }}>
                            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 4, height: 24, background: 'var(--green)', borderRadius: 4 }} /> Job Description</h2>
                            {/<[a-z/][\s\S]*>/i.test(job.description) ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: job.description }} />
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</div>
                            )}
                        </div>

                        {job.requirements?.length > 0 && (
                            <div className="animate-fade-in-delay-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, boxShadow: 'var(--card-shadow)' }}>
                                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 4, height: 24, background: '#3b82f6', borderRadius: 4 }} /> Requirements</h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {job.requirements.map((req, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
                                            <span style={{ color: '#3b82f6', marginTop: 4 }}>✓</span> {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="animate-fade-in-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Job Overview Card */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, boxShadow: 'var(--card-shadow)' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 24 }}>Job Overview</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {[
                                    { icon: <HiCurrencyDollar />, label: 'Salary (Yearly)', value: salary, color: 'var(--stat-grn-cl)', bg: 'var(--stat-grn-bg)' },
                                    { icon: <HiBriefcase />, label: 'Job Type', value: job.type, color: typeStyle.color, bg: typeStyle.bg },
                                    { icon: <HiLocationMarker />, label: 'Location', value: job.location, color: 'var(--stat-blue-cl)', bg: 'var(--stat-blue-bg)' },
                                    { icon: <HiUsers />, label: 'Experience Level', value: job.experienceLevel || 'Not specified', color: 'var(--stat-pur-cl)', bg: 'var(--stat-pur-bg)' },
                                    { icon: <HiOfficeBuilding />, label: 'Category', value: job.category, color: 'var(--stat-amb-cl)', bg: 'var(--stat-amb-bg)' },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                                        <div>
                                            <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</p>
                                            <p style={{ color: 'var(--text)', fontSize: '1.05rem', fontWeight: 700, textTransform: 'capitalize' }}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills Card */}
                        {job.skills?.length > 0 && (
                            <div className="animate-fade-in-delay-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, boxShadow: 'var(--card-shadow)' }}>
                                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 20 }}>Required Skills</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {job.skills.map((skill, i) => (
                                        <span key={i} style={{ background: 'var(--tag-bg)', color: 'var(--tag-color)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
            
            <Footer />
            
            {/* Inject small style for mobile responsive grid */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 900px) {
                    .md-grid-1 { grid-template-columns: 1fr !important; }
                }
            `}} />
        </div>
    );
}

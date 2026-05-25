import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { applicationsAPI, resumesAPI, aiAPI, profileAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
    HiBriefcase, HiDocumentText, HiClock, HiCheckCircle,
    HiUpload, HiSearch, HiArrowRight, HiExternalLink, HiLink, HiPlus, HiTrash
} from 'react-icons/hi';

function StatCard({ icon, label, value, bgVar, colorVar }) {
    return (
        <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
            padding: 20, display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: 'var(--card-shadow)', transition: 'transform 0.2s'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `var(${bgVar})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: `var(${colorVar})`, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1 }}>{value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>{label}</p>
            </div>
        </div>
    );
}

const statusStyle = {
    pending: { background: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)' },
    reviewed: { background: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' },
    shortlisted: { background: 'var(--stat-grn-bg)', color: 'var(--stat-grn-cl)' },
    rejected: { background: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    accepted: { background: 'var(--stat-grn-bg)', color: 'var(--stat-grn-cl)' },
};

export default function SeekerDashboard() {
    const { user, refreshUser } = useAuth();
    const { dark } = useTheme();
    const { notifications } = useNotifications();
    const [applications, setApplications] = useState([]);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [viewingReply, setViewingReply] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const scheduledInterviews = applications.filter(app => app.interview && app.interview.status === 'scheduled');

    // Extensions States
    const [verifying, setVerifying] = useState(false);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', projectUrl: '' });
    const [portfolioFile, setPortfolioFile] = useState(null);
    const [submittingPortfolio, setSubmittingPortfolio] = useState(false);

    const handleVerificationUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVerifying(true);
        try {
            const formData = new FormData();
            formData.append('verificationDoc', file);
            await profileAPI.requestVerification(formData);
            await refreshUser();
            toast.success('Verification document uploaded! Status updated to Pending.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification request failed');
        } finally {
            setVerifying(false);
        }
    };

    const handlePortfolioSubmit = async (e) => {
        e.preventDefault();
        if (!portfolioForm.title.trim()) return toast.error('Project title is required');
        setSubmittingPortfolio(true);
        try {
            const formData = new FormData();
            formData.append('title', portfolioForm.title);
            formData.append('description', portfolioForm.description);
            formData.append('projectUrl', portfolioForm.projectUrl);
            if (portfolioFile) {
                formData.append('portfolioFile', portfolioFile);
            }
            await profileAPI.uploadPortfolio(formData);
            await refreshUser();
            toast.success('Portfolio project added successfully! 🚀');
            setShowPortfolioModal(false);
            setPortfolioForm({ title: '', description: '', projectUrl: '' });
            setPortfolioFile(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add portfolio item');
        } finally {
            setSubmittingPortfolio(false);
        }
    };

    const handlePortfolioDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this portfolio project?')) return;
        try {
            await profileAPI.deletePortfolio(projectId);
            await refreshUser();
            toast.success('Portfolio project deleted!');
        } catch (err) {
            toast.error('Failed to delete portfolio project');
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            if (latest.type === 'reply_received' || latest.type === 'interview_scheduled' || latest.type === 'interview_cancelled') {
                // Fetch data silently
                applicationsAPI.getMyApplications({ limit: 50 })
                    .then(res => {
                        setApplications(res.data.applications || []);
                        
                        // If we are currently viewing the replies of the modified application, update the modal details too!
                        if (viewingReply) {
                            const updatedApp = res.data.applications?.find(a => a._id === viewingReply._id);
                            if (updatedApp) setViewingReply(updatedApp);
                        }
                    })
                    .catch(err => console.error(err));
            }
        }
    }, [notifications]);

    const submitSeekerReply = async () => {
        if (!replyText.trim() || !viewingReply) return;
        setSubmittingReply(true);
        try {
            await applicationsAPI.replyToApplication(viewingReply._id, { message: replyText });
            const newReply = { senderRole: 'jobseeker', message: replyText, createdAt: new Date() };
            const updatedApp = { ...viewingReply, replies: [...(viewingReply.replies || []), newReply] };
            setViewingReply(updatedApp);
            setApplications(applications.map(a => a._id === viewingReply._id ? updatedApp : a));
            setReplyText('');
            toast.success('Message sent!');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSubmittingReply(false);
        }
    };

    const fetchData = async () => {
        try {
            const [appsRes, resumeRes, recsRes] = await Promise.allSettled([
                applicationsAPI.getMyApplications({ limit: 50 }),
                resumesAPI.getMy(),
                aiAPI.getRecommendations()
            ]);
            if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.applications || []);
            if (resumeRes.status === 'fulfilled') setResume(resumeRes.value.data.resume);
            if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data.recommendations || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') return toast.error('Only PDF files are allowed');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            const res = await resumesAPI.upload(formData);
            setResume(res.data.resume);
            toast.success('Resume uploaded!');
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setUploading(false); }
    };

    if (loading) return <><Navbar /><Loader /></>;

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
    };

    const profileItems = [
        { label: 'Full name', done: !!(user?.firstName || user?.name) },
        { label: 'Email verified', done: !!user?.email },
        { label: 'Headline / bio', done: !!user?.headline },
        { label: 'Skills listed', done: user?.skills?.length > 0 },
        { label: 'Resume uploaded', done: !!resume },
    ];
    const profilePct = Math.round((profileItems.filter(i => i.done).length / profileItems.length) * 100);

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>
            <Navbar />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 5% 80px' }}>

                {/* Header */}
                <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text)', marginBottom: 4 }}>
                            Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'there'} 👋
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here's your job search overview</p>
                    </div>
                    <Link to="/jobs" className="btn-green" style={{ textDecoration: 'none' }}>
                        <HiSearch /> Find Jobs
                    </Link>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <StatCard icon={<HiBriefcase />} label="Total Applied" value={stats.total} bgVar="--stat-blue-bg" colorVar="--stat-blue-cl" />
                    <StatCard icon={<HiClock />} label="Pending" value={stats.pending} bgVar="--stat-amb-bg" colorVar="--stat-amb-cl" />
                    <StatCard icon={<HiDocumentText />} label="Shortlisted" value={stats.shortlisted} bgVar="--stat-grn-bg" colorVar="--stat-grn-cl" />
                    <StatCard icon={<HiCheckCircle />} label="Accepted" value={stats.accepted} bgVar="--stat-pur-bg" colorVar="--stat-pur-cl" />
                </div>

                {/* AI Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="animate-fade-in-delay" style={{
                        background: 'linear-gradient(135deg, var(--green-bg), rgba(34, 197, 94, 0.05))',
                        border: '1.5px solid var(--green-border)',
                        borderRadius: 16, padding: 24, marginBottom: 32,
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.08)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.4rem' }}>✨</span>
                                <div>
                                    <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', margin: 0 }}>AI Smart Match Recommendations</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>Recommended jobs sorted by compatibility with your profile skills & experience</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                            {recommendations.slice(0, 3).map(({ job, matchScore, matchDetails }) => (
                                <div 
                                    key={job._id}
                                    style={{
                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                        borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-between', transition: 'all 0.2s',
                                        boxShadow: 'var(--card-shadow)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#22c55e';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.transform = 'none';
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
                                                {job.title}
                                            </h3>
                                            <span style={{
                                                background: matchScore >= 75 ? 'var(--stat-grn-bg)' : matchScore >= 50 ? 'var(--stat-blue-bg)' : 'var(--tag-bg)',
                                                color: matchScore >= 75 ? 'var(--stat-grn-cl)' : matchScore >= 50 ? 'var(--stat-blue-cl)' : 'var(--text-muted)',
                                                fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 99,
                                                display: 'flex', alignItems: 'center', gap: 3
                                            }}>
                                                🎯 {matchScore}% Match
                                            </span>
                                        </div>

                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 8px 0' }}>
                                            {job.company} · <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{job.location}</span>
                                        </p>

                                        {/* Matched Skills */}
                                        {matchDetails.matchedSkills?.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                                {matchDetails.matchedSkills.slice(0, 3).map((s, idx) => (
                                                    <span key={idx} className="skill-tag" style={{ background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-border)', fontSize: '0.68rem', padding: '1px 6px' }}>
                                                        ✓ {s}
                                                    </span>
                                                ))}
                                                {matchDetails.matchedSkills.length > 3 && (
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                                        +{matchDetails.matchedSkills.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.3, margin: '0 0 16px 0', fontStyle: 'italic' }}>
                                            "{matchDetails.reason}"
                                        </p>
                                    </div>

                                    <Link 
                                        to={`/jobs/${job._id}`}
                                        className="btn-green"
                                        style={{
                                            textDecoration: 'none', justifyContent: 'center', width: '100%',
                                            padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700
                                        }}
                                    >
                                        View Job Details <HiArrowRight />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}
                    className="lg:grid-cols-[1fr_300px] grid-cols-1">

                    {/* Left Column Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Applications Table */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>My Applications</h2>
                                <Link to="/jobs" style={{ color: 'var(--green)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Find more <HiArrowRight />
                                </Link>
                            </div>

                            {applications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                    <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>No applications yet. Start your job search!</p>
                                    <Link to="/jobs" className="btn-green" style={{ textDecoration: 'none' }}><HiSearch /> Browse Jobs</Link>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                {['Job', 'Company', 'Status', 'Applied', ''].map(h => (
                                                    <th key={h} style={{ padding: '0 0 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map(app => (
                                                <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '14px 0', fontWeight: 600, color: 'var(--text)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {app.job?.title || 'N/A'}
                                                            {app.interview && app.interview.status === 'scheduled' && (
                                                                <span 
                                                                    style={{ background: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }}
                                                                    title={`Interview scheduled on ${new Date(app.interview.scheduledAt).toLocaleString()}`}
                                                                >
                                                                    📅 Interview
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '14px 0', color: 'var(--text-muted)' }}>{app.job?.company || 'N/A'}</td>
                                                    <td style={{ padding: '14px 0' }}>
                                                        <span style={{ ...statusStyle[app.status], padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 0', color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '14px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        {app.replies && app.replies.length > 0 && (
                                                            <button 
                                                                onClick={() => setViewingReply(app)}
                                                                style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--green)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                                                            >
                                                                Messages ({app.replies.length})
                                                            </button>
                                                        )}
                                                        <Link to={`/jobs/${app.job?._id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 16 }}><HiExternalLink /></Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Portfolio Section */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div>
                                    <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', margin: 0 }}>My Portfolio Projects</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '2px 0 0 0' }}>Showcase your work and achievements to potential employers</p>
                                </div>
                                <button onClick={() => setShowPortfolioModal(true)} className="btn-green" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', fontSize: '0.8rem' }}>
                                    <HiPlus /> Add Project
                                </button>
                            </div>

                            {!user.portfolioProjects || user.portfolioProjects.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '36px 0', border: '1.5px dashed var(--border)', borderRadius: 12 }}>
                                    <p style={{ fontSize: '2rem', marginBottom: 8, margin: 0 }}>📂</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>No portfolio items uploaded yet. Add projects to boost profile views!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                                    {user.portfolioProjects.map(proj => (
                                        <div key={proj._id} style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                                            <button onClick={() => handlePortfolioDelete(proj._id)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 15 }} title="Delete project">
                                                <HiTrash />
                                            </button>
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', margin: '0 0 4px 0', paddingRight: 20 }}>{proj.title}</h4>
                                                {proj.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4, margin: '0 0 10px 0' }}>{proj.description}</p>}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, alignItems: 'center' }}>
                                                {proj.projectUrl && (
                                                    <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                        <HiLink /> Live Link
                                                    </a>
                                                )}
                                                {proj.fileUrl && (
                                                    <a href={`http://localhost:5000${proj.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                        📄 File: {proj.fileName}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Upcoming Interviews */}
                        {scheduledInterviews.length > 0 && (
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--green-border)', borderRadius: 16, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                                <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    📅 Upcoming Interviews
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {scheduledInterviews.map(app => (
                                        <div key={app._id} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                                            <h4 style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)', margin: '0 0 2px 0' }}>{app.job?.title}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 8px 0' }}>{app.job?.company}</p>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text)', marginBottom: 6 }}>
                                                <strong>Time:</strong> {new Date(app.interview.scheduledAt).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text)', marginBottom: 6, textTransform: 'capitalize' }}>
                                                <strong>Type:</strong> {app.interview.type}
                                            </div>
                                            {app.interview.linkOrLocation && (
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text)', marginBottom: 6 }}>
                                                    {app.interview.type === 'online' ? (
                                                        <a href={app.interview.linkOrLocation} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                                            <HiLink /> Join Meeting
                                                        </a>
                                                    ) : (
                                                        <span><strong>Location:</strong> {app.interview.linkOrLocation}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume card */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 16 }}>Resume</h3>
                            {resume ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                                    <HiDocumentText style={{ color: 'var(--green)', fontSize: 24, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ color: 'var(--text)', fontSize: '0.83rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume.originalName}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{(resume.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>No resume uploaded yet.</p>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: '1.5px dashed var(--border)', color: 'var(--text-muted)', fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                    <HiUpload />
                                    {uploading ? 'Uploading...' : resume ? 'Replace Resume' : 'Upload Resume (PDF)'}
                                    <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                                </label>
                                <Link to="/resume-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text)', fontSize: '0.83rem', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                    ✍️ Build Online Resume
                                </Link>
                            </div>
                        </div>

                        {/* Profile Verification */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                🛡️ Verification Status
                            </h3>
                            {user.isVerified ? (
                                <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <HiCheckCircle style={{ color: 'var(--green)', fontSize: 20 }} />
                                    <div>
                                        <p style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>Verified Profile</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>Your identity has been verified.</p>
                                    </div>
                                </div>
                            ) : user.verificationStatus === 'pending' ? (
                                <div style={{ background: 'var(--stat-blue-bg)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 10, padding: 12 }}>
                                    <p style={{ color: 'var(--stat-blue-cl)', fontSize: '0.82rem', fontWeight: 700, margin: '0 0 2px 0' }}>Request Pending</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>Admin is reviewing your verification document.</p>
                                </div>
                            ) : (
                                <div>
                                    {user.verificationStatus === 'rejected' && (
                                        <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 10px 0' }}>❌ Verification rejected. Please re-submit.</p>
                                    )}
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 12 }}>Upload a scan of your ID or business proof to verify your account.</p>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: '1.5px dashed var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                        <HiUpload />
                                        {verifying ? 'Uploading...' : 'Upload document'}
                                        <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleVerificationUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Profile Completion */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Profile</h3>
                                <span style={{ fontWeight: 800, color: 'var(--green)', fontSize: '1.1rem' }}>{profilePct}%</span>
                            </div>
                            {/* Progress bar */}
                            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, marginBottom: 18 }}>
                                <div style={{ height: '100%', width: `${profilePct}%`, background: '#22c55e', borderRadius: 99, transition: 'width 0.6s ease' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {profileItems.map(item => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.83rem' }}>
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.done ? '#22c55e' : 'var(--border)', color: item.done ? '#fff' : 'var(--text-faint)', fontSize: 11 }}>
                                            {item.done ? '✓' : ''}
                                        </div>
                                        <span style={{ color: item.done ? 'var(--text)' : 'var(--text-muted)' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/profile" style={{ display: 'block', marginTop: 18, textAlign: 'center', color: 'var(--green)', textDecoration: 'none', fontWeight: 600, fontSize: '0.83rem' }}>
                                Edit Profile →
                            </Link>
                        </div>

                        {/* Quick Links */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, boxShadow: 'var(--card-shadow)' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 14 }}>Quick Links</h3>
                            {[{ to: '/jobs', label: '🔍 Browse Jobs' }, { to: '/profile', label: '👤 Edit Profile' }].map(link => (
                                <Link key={link.to} to={link.to} style={{ display: 'block', padding: '10px 14px', borderRadius: 8, marginBottom: 8, color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Messages Modal */}
            {viewingReply && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 20px', width: '100%', maxWidth: 540, boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 2 }}>Messages</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    With <strong>{viewingReply.job?.company}</strong> for <strong>{viewingReply.job?.title}</strong>
                                </p>
                            </div>
                            <button onClick={() => { setViewingReply(null); setReplyText(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' }}>×</button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
                            {viewingReply.replies?.map((reply, i) => (
                                <div key={i} style={{ 
                                    maxWidth: '85%', padding: '12px 14px', borderRadius: 12,
                                    alignSelf: reply.senderRole === 'jobseeker' ? 'flex-end' : 'flex-start',
                                    background: reply.senderRole === 'jobseeker' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-subtle)',
                                    border: `1px solid ${reply.senderRole === 'jobseeker' ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)'}`,
                                    color: 'var(--text)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: reply.senderRole === 'jobseeker' ? 'var(--green)' : 'var(--text)' }}>
                                            {reply.senderRole === 'jobseeker' ? 'You' : viewingReply.job?.company}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {new Date(reply.createdAt).toLocaleDateString()} {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{reply.message}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ flexShrink: 0, marginTop: 10 }}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply here..."
                                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', resize: 'none', height: 80, fontSize: '0.9rem', marginBottom: 12 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => { setViewingReply(null); setReplyText(''); }}>Close</button>
                                <button className="btn-green" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={submitSeekerReply} disabled={submittingReply}>
                                    {submittingReply ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Portfolio Modal */}
            {showPortfolioModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)', margin: 0 }}>Add Portfolio Project</h3>
                            <button onClick={() => setShowPortfolioModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                        </div>
                        <form onSubmit={handlePortfolioSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Project Title *</label>
                                <input value={portfolioForm.title} onChange={e => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))} className="input-light" required placeholder="e.g. Chat Application" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Description</label>
                                <textarea value={portfolioForm.description} onChange={e => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="input-light" style={{ resize: 'vertical' }} placeholder="Brief overview of the project..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Project / Demo Link</label>
                                <input type="url" value={portfolioForm.projectUrl} onChange={e => setPortfolioForm(prev => ({ ...prev, projectUrl: e.target.value }))} className="input-light" placeholder="https://myproject.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Project File Upload (optional)</label>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1.5px dashed var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-subtle)' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                    <HiUpload />
                                    {portfolioFile ? `Attached: ${portfolioFile.name}` : 'Upload image/PDF/ZIP'}
                                    <input type="file" onChange={e => setPortfolioFile(e.target.files[0])} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                <button type="button" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => setShowPortfolioModal(false)}>Cancel</button>
                                <button type="submit" disabled={submittingPortfolio} className="btn-green" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                                    {submittingPortfolio ? 'Adding...' : 'Add Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

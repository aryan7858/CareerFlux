import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI, resumesAPI, aiAPI, profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiMail, HiLocationMarker, HiDownload, HiLink, HiCheckCircle } from 'react-icons/hi';

const statusOptions = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

export default function ViewApplicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [jobInfo, setJobInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [employers, setEmployers] = useState([]);
    const [aiScreening, setAiScreening] = useState({});
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [viewingResume, setViewingResume] = useState(null);
    const { notifications } = useNotifications();
    const [schedulingFor, setSchedulingFor] = useState(null);
    const [interviewForm, setInterviewForm] = useState({ scheduledAt: '', type: 'online', linkOrLocation: '', notes: '' });
    const [submittingInterview, setSubmittingInterview] = useState(false);

    const handleToggleEndorsement = async (applicantId, skill) => {
        try {
            const res = await profileAPI.toggleEndorsement(applicantId, skill);
            setApplications(applications.map(app => {
                if (app.applicant?._id === applicantId) {
                    return {
                        ...app,
                        applicant: {
                            ...app.applicant,
                            endorsements: res.data.endorsements
                        }
                    };
                }
                return app;
            }));
            toast.success(res.data.message || 'Endorsement updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update endorsement');
        }
    };

    useEffect(() => { 
        fetchApplicants(); 
        fetchEmployers();
    }, [jobId]);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            if (latest.type === 'reply_received' || latest.type === 'interview_cancelled' || latest.type === 'interview_scheduled') {
                // Fetch applicants silently
                applicationsAPI.getJobApplications(jobId, { limit: 50 })
                    .then(res => {
                        setApplications(res.data.applications);
                    })
                    .catch(err => console.error(err));
            }
        }
    }, [notifications]);

    const fetchApplicants = async () => {
        try { 
            const res = await applicationsAPI.getJobApplications(jobId, { limit: 50 }); 
            setApplications(res.data.applications); 
            setJobInfo(res.data.job);
            
            // Retrieve AI Screening metrics
            fetchAiScreening();
        }
        catch { toast.error('Failed to load applicants'); navigate('/employer/dashboard'); }
        finally { setLoading(false); }
    };

    const fetchAiScreening = async () => {
        if (!jobId) return;
        setAiLoading(true);
        try {
            const res = await aiAPI.screenApplicants(jobId);
            const list = res.data.screened || [];
            const mapping = {};
            list.forEach(item => {
                mapping[item.applicationId] = item;
            });
            setAiScreening(mapping);
        } catch (err) {
            console.error('Failed to load AI screening reports:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const fetchEmployers = async () => {
        try {
            const res = await applicationsAPI.getEmployersList();
            setEmployers(res.data.employers || []);
        } catch (err) {
            console.error('Failed to load employers', err);
        }
    };

    const updateStatus = async (appId, status) => {
        try { await applicationsAPI.updateStatus(appId, { status }); setApplications(applications.map(a => a._id === appId ? { ...a, status } : a)); toast.success(`Status updated to ${status}`); }
        catch { toast.error('Failed to update status'); }
    };

    const handleTransfer = async (appId, targetEmployerId) => {
        try {
            const res = await applicationsAPI.transferApplication(appId, { assignedTo: targetEmployerId || null });
            setApplications(applications.map(a => a._id === appId ? res.data.application : a));
            toast.success(targetEmployerId ? 'Application transferred successfully' : 'Application unassigned');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to transfer application');
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!interviewForm.scheduledAt) return toast.error('Please select a date and time.');
        setSubmittingInterview(true);
        try {
            const res = await applicationsAPI.scheduleInterview(schedulingFor._id, interviewForm);
            setApplications(applications.map(a => a._id === schedulingFor._id ? res.data.application : a));
            toast.success('Interview scheduled successfully! 📅');
            setSchedulingFor(null);
            setInterviewForm({ scheduledAt: '', type: 'online', linkOrLocation: '', notes: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule interview');
        } finally {
            setSubmittingInterview(false);
        }
    };

    const handleCancelInterview = async (appId) => {
        if (!window.confirm('Are you sure you want to cancel this interview?')) return;
        try {
            const res = await applicationsAPI.cancelInterview(appId);
            setApplications(applications.map(a => a._id === appId ? res.data.application : a));
            toast.success('Interview cancelled.');
        } catch (err) {
            toast.error('Failed to cancel interview');
        }
    };

    const downloadResume = async (resumeId, originalName) => {
        try {
            const res = await resumesAPI.download(resumeId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName || 'resume.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error('Failed to download resume');
        }
    };

    const submitReply = async (appId) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        try {
            await applicationsAPI.replyToApplication(appId, { message: replyText });
            const newReply = { senderRole: 'employer', message: replyText, createdAt: new Date() };
            setApplications(applications.map(a => a._id === appId ? { ...a, replies: [...(a.replies || []), newReply] } : a));
            toast.success(`Reply sent successfully!`);
            setReplyingTo(null);
            setReplyText('');
        } catch {
            toast.error('Failed to send reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    if (loading) return <><Navbar /><Loader /></>;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>
            <Navbar />
            <div className="pt-24 pb-16 px-[5%] max-w-7xl mx-auto">
                <button onClick={() => navigate('/employer/dashboard')} className="flex items-center gap-1.5 text-[color:var(--text-muted)] hover:text-[color:var(--text)] text-sm mb-6 transition-colors bg-transparent border-none cursor-pointer">
                    <HiArrowLeft /> Back to Dashboard
                </button>

                <div className="mb-8 animate-fade-in">
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Applicants</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{jobInfo?.title} at {jobInfo?.company} · {applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
                </div>

                {applications.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mb-6" style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none', paddingBottom: 2 }}>
                        {['all', ...statusOptions].map(status => {
                            const count = status === 'all' ? applications.length : applications.filter(a => a.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status)}
                                    style={{
                                        padding: '10px 18px',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === status ? '3px solid var(--green)' : '3px solid transparent',
                                        color: activeTab === status ? 'var(--text)' : 'var(--text-muted)',
                                        fontWeight: activeTab === status ? 700 : 500,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                        marginBottom: '-2px'
                                    }}
                                    onMouseEnter={e => { if (activeTab !== status) e.currentTarget.style.color = 'var(--text)'; }}
                                    onMouseLeave={e => { if (activeTab !== status) e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    {status} <span style={{ opacity: 0.7, fontSize: '0.8rem', marginLeft: 4 }}>({count})</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--card-shadow)' }}>
                        <p className="text-4xl mb-3">👥</p>
                        <p style={{ color: 'var(--text-muted)' }}>No applications received yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.filter(a => activeTab === 'all' || a.status === activeTab).length === 0 ? (
                            <div className="p-10 text-center" style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 16 }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No applicants currently marked as <strong>{activeTab}</strong>.</p>
                            </div>
                        ) : applications.filter(a => activeTab === 'all' || a.status === activeTab).map((app) => (
                            <div key={app._id} className="p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--card-shadow)' }}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full stat-icon-blue flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            {app.applicant?.firstName?.charAt(0)}{app.applicant?.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                                {app.applicant?.firstName} {app.applicant?.lastName}
                                                {app.applicant?.isVerified && (
                                                    <HiCheckCircle style={{ color: '#3b82f6', fontSize: 18 }} title="Verified Candidate" />
                                                )}
                                                {aiScreening[app._id] && (
                                                    <button
                                                        onClick={() => setSelectedReport(aiScreening[app._id])}
                                                        style={{
                                                            background: aiScreening[app._id].matchScore >= 75 ? 'var(--stat-grn-bg)' : aiScreening[app._id].matchScore >= 50 ? 'var(--stat-blue-bg)' : 'var(--tag-bg)',
                                                            color: aiScreening[app._id].matchScore >= 75 ? 'var(--stat-grn-cl)' : aiScreening[app._id].matchScore >= 50 ? 'var(--stat-blue-cl)' : 'var(--text-muted)',
                                                            border: 'none', borderRadius: 99, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 800,
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                                                        }}
                                                        title="Click to view full AI Compatibility Report"
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                                    >
                                                        ✨ {aiScreening[app._id].matchScore}% Match
                                                    </button>
                                                )}
                                            </h3>
                                            {app.applicant?.headline && (
                                                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{app.applicant.headline}</p>
                                            )}
                                            <div className="flex flex-wrap gap-3 text-[color:var(--text-muted)] text-xs mt-2">
                                                <span 
                                                    className="flex items-center gap-1"
                                                    style={{ 
                                                        fontFamily: 'monospace', 
                                                        background: 'var(--bg-subtle)', 
                                                        padding: '2px 8px', 
                                                        borderRadius: 6,
                                                        border: '1px solid var(--border)',
                                                        cursor: 'pointer' 
                                                    }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(app.applicant?._id);
                                                        toast.success('User ID copied to clipboard!');
                                                    }}
                                                    title="Click to copy User ID"
                                                >
                                                    ID: {app.applicant?._id}
                                                </span>
                                                <span className="flex items-center gap-1"><HiMail /> {app.applicant?.email}</span>
                                                {app.applicant?.location && <span className="flex items-center gap-1"><HiLocationMarker /> {app.applicant.location}</span>}
                                            </div>
                                            {app.applicant?.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {app.applicant.skills.map((s, i) => {
                                                        const skillEndorsements = app.applicant.endorsements?.filter(e => e.skill.toLowerCase() === s.toLowerCase()) || [];
                                                        const count = skillEndorsements.length;
                                                        const hasEndorsed = skillEndorsements.some(e => e.byUser?._id === user?._id || e.byUser === user?._id);

                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => handleToggleEndorsement(app.applicant._id, s)}
                                                                className={`skill-tag flex items-center gap-1 cursor-pointer transition-all duration-200 border ${
                                                                    hasEndorsed 
                                                                        ? 'bg-[color:var(--green-bg)] text-[color:var(--green)] border-[color:var(--green-border)] font-bold' 
                                                                        : 'bg-[color:var(--tag-bg)] text-[color:var(--tag-color)] border-[color:var(--border)]'
                                                                }`}
                                                                style={{ borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', outline: 'none' }}
                                                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                                                                title={hasEndorsed ? 'Remove skill endorsement' : 'Endorse this skill'}
                                                            >
                                                                <span>{s}</span>
                                                                <span style={{ fontSize: '0.65rem', opacity: 0.8, background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4, marginLeft: 2 }}>
                                                                    👍 {count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-[color:var(--text-muted)] font-medium tracking-wider">STATUS</span>
                                            <select value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}
                                                className={`text-xs px-3 py-2 rounded-lg font-medium outline-none cursor-pointer status-${app.status}`} style={{ border: '1px solid var(--border)' }}
                                            >
                                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-[color:var(--text-muted)] font-medium tracking-wider">ASSIGNED TO</span>
                                            <select 
                                                value={app.assignedTo?._id || app.assignedTo || ''} 
                                                onChange={(e) => handleTransfer(app._id, e.target.value)}
                                                className="text-xs px-3 py-2 rounded-lg font-medium outline-none cursor-pointer" 
                                                style={{ 
                                                    border: '1px solid var(--border)', 
                                                    background: 'var(--surface)', 
                                                    color: 'var(--text)' 
                                                }}
                                            >
                                                <option value="">Unassigned</option>
                                                {employers.map(emp => (
                                                    <option key={emp._id} value={emp._id}>
                                                        {emp.firstName} {emp.lastName || ''} ({emp.companyName || emp.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-[color:var(--text-muted)] font-medium tracking-wider">INTERVIEW</span>
                                            {app.interview && app.interview.status === 'scheduled' ? (
                                                <button 
                                                    onClick={() => handleCancelInterview(app._id)}
                                                    style={{ 
                                                        padding: '7px 12px', 
                                                        fontSize: '0.72rem', 
                                                        fontWeight: 700,
                                                        background: '#ef4444',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 1}
                                                >
                                                    Cancel Interview
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setSchedulingFor(app);
                                                        setInterviewForm({
                                                            scheduledAt: app.interview?.scheduledAt ? new Date(app.interview.scheduledAt).toISOString().slice(0, 16) : '',
                                                            type: app.interview?.type || 'online',
                                                            linkOrLocation: app.interview?.linkOrLocation || '',
                                                            notes: app.interview?.notes || ''
                                                        });
                                                    }}
                                                    style={{ 
                                                        padding: '7px 12px', 
                                                        fontSize: '0.72rem', 
                                                        fontWeight: 700,
                                                        background: 'var(--green)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 1}
                                                >
                                                    {app.interview?.status === 'cancelled' ? 'Reschedule' : 'Schedule Interview'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {app.resume ? (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-[color:var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-2">Resume</p>
                                        <div className="flex gap-4">
                                            <button 
                                                className="flex items-center gap-2 cursor-pointer transition-colors hover:text-green-500" 
                                                style={{ color: 'var(--green)', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500 }}
                                                onClick={() => downloadResume(app.resume._id, app.resume.originalName)}
                                            >
                                                <HiDownload /> Download {app.resume.originalName}
                                            </button>
                                            <button 
                                                className="flex items-center gap-2 cursor-pointer transition-colors hover:text-blue-500" 
                                                style={{ color: '#3b82f6', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500 }}
                                                onClick={() => setViewingResume(app.resume)}
                                            >
                                                👁️ View Resume
                                            </button>
                                        </div>
                                    </div>
                                ) : app.applicant?.resumeUrl ? (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-[color:var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-2">Resume Link</p>
                                        <a 
                                            href={app.applicant.resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 transition-colors hover:text-blue-500" 
                                            style={{ color: '#3b82f6', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}
                                        >
                                            <HiDownload /> View External Resume
                                        </a>
                                    </div>
                                ) : null}
                                
                                {app.interview && app.interview.status === 'scheduled' && (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-[color:var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-2">📅 Scheduled Interview</p>
                                        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 10 }}>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>DATE & TIME</span>
                                                    <strong style={{ color: 'var(--text)', fontSize: '0.85rem' }}>{new Date(app.interview.scheduledAt).toLocaleString()}</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>TYPE</span>
                                                    <strong style={{ color: 'var(--text)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{app.interview.type}</strong>
                                                </div>
                                                {app.interview.linkOrLocation && (
                                                    <div>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>LOCATION / LINK</span>
                                                        {app.interview.type === 'online' ? (
                                                            <a href={app.interview.linkOrLocation} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                <HiLink /> Join Meeting
                                                            </a>
                                                        ) : (
                                                            <strong style={{ color: 'var(--text)', fontSize: '0.85rem' }}>{app.interview.linkOrLocation}</strong>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {app.interview.notes && (
                                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600, marginBottom: 2 }}>NOTES</span>
                                                    <p style={{ color: 'var(--text)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>{app.interview.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {app.coverLetter && (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-[color:var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1">Cover Letter</p>
                                        <p className="text-[color:var(--text)] text-sm leading-relaxed">{app.coverLetter}</p>
                                    </div>
                                )}
                                {app.applicant?.portfolioProjects?.length > 0 && (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-[color:var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-2">Portfolio Projects</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                                            {app.applicant.portfolioProjects.map(proj => (
                                                <div key={proj._id} style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', margin: '0 0 2px 0' }}>{proj.title}</h4>
                                                        {proj.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.35, margin: '0 0 8px 0' }}>{proj.description}</p>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', marginTop: 6, alignItems: 'center' }}>
                                                        {proj.projectUrl && (
                                                            <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
                                                                🔗 Demo Link
                                                            </a>
                                                        )}
                                                        {proj.fileUrl && (
                                                            <a href={`http://localhost:5000${proj.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
                                                                📄 File
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {app.replies && app.replies.length > 0 && (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-[color:var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-3">Messages</p>
                                        <div className="space-y-3">
                                            {app.replies.map((reply, i) => {
                                                const isSystem = reply.message && reply.message.startsWith('[System]');
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`p-3 rounded-lg ${isSystem ? 'mx-auto text-center' : reply.senderRole === 'employer' ? 'ml-auto' : 'mr-auto'}`} 
                                                        style={{ 
                                                            maxWidth: isSystem ? '100%' : '85%', 
                                                            width: isSystem ? '100%' : 'auto',
                                                            background: isSystem ? 'rgba(255, 255, 255, 0.03)' : reply.senderRole === 'employer' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-subtle)', 
                                                            border: `1px solid ${isSystem ? 'var(--border)' : reply.senderRole === 'employer' ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)'}`, 
                                                            color: isSystem ? 'var(--text-muted)' : 'var(--text)',
                                                            fontStyle: isSystem ? 'italic' : 'normal'
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold" style={{ color: isSystem ? 'var(--text-muted)' : reply.senderRole === 'employer' ? 'var(--green)' : 'var(--text)' }}>
                                                                {isSystem ? '⚙️ System Log' : reply.senderRole === 'employer' ? 'You' : 'Applicant'}
                                                            </span>
                                                            <span className="text-[10px] text-[color:var(--text-muted)]">
                                                                {new Date(reply.createdAt).toLocaleDateString()} {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{isSystem ? reply.message.replace('[System] ', '') : reply.message}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                    {replyingTo === app._id ? (
                                        <div className="animate-fade-in">
                                            <textarea
                                                className="w-full bg-grid p-3 rounded-xl outline-none resize-none mb-3"
                                                style={{ border: '1px solid var(--border)', minHeight: '100px', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)' }}
                                                placeholder="Write your reply to the applicant..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    className="btn-green text-sm py-2 px-4"
                                                    onClick={() => submitReply(app._id)}
                                                    disabled={submittingReply}
                                                >
                                                    {submittingReply ? 'Sending...' : 'Send Reply'}
                                                </button>
                                                <button 
                                                    className="text-sm hover:text-[color:var(--text)] transition-colors bg-transparent border-none cursor-pointer"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                    disabled={submittingReply}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            className="text-sm font-medium transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5"
                                            style={{ color: 'var(--text)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                                            onClick={() => { setReplyingTo(app._id); setReplyText(''); }}
                                        >
                                            <HiMail /> {app.replies && app.replies.length > 0 ? 'Send Another Reply' : 'Add Reply'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Screening Report Modal */}
            {selectedReport && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="animate-fade-in" style={{
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
                        padding: '24px 24px', width: '100%', maxWidth: 520, boxShadow: 'var(--card-shadow)',
                        display: 'flex', flexDirection: 'column', maxHeight: '85vh'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: '1.4rem' }}>✨</span>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', margin: 0 }}>AI Smart Match Report</h3>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                    Compatibility assessment for <strong>{selectedReport.applicantName}</strong>
                                </p>
                            </div>
                            <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 18, paddingRight: 6 }}>
                            
                            {/* Score Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, var(--green-bg), rgba(34, 197, 94, 0.05))',
                                border: '1.5px solid var(--green-border)', borderRadius: 12, padding: '16px 20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-dark)', textTransform: 'uppercase', tracking: '0.05em' }}>Overall Score</span>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, marginTop: 4 }}>
                                        {selectedReport.matchScore}% <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>Compatibility</span>
                                    </div>
                                </div>
                                <div style={{
                                    background: selectedReport.report?.recommendation === 'Shortlist' ? 'var(--stat-grn-bg)' : selectedReport.report?.recommendation === 'Interview' ? 'var(--stat-blue-bg)' : 'rgba(239, 68, 68, 0.12)',
                                    color: selectedReport.report?.recommendation === 'Shortlist' ? 'var(--stat-grn-cl)' : selectedReport.report?.recommendation === 'Interview' ? 'var(--stat-blue-cl)' : '#ef4444',
                                    padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700
                                }}>
                                    🎯 {selectedReport.report?.recommendation || 'Reviewed'}
                                </div>
                            </div>

                            {/* Detailed Analysis Reason */}
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6 }}>AI Recommendation Reason</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                                    {selectedReport.report?.reason}
                                </p>
                            </div>

                            {/* Strengths */}
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: 'var(--green)' }}>✓</span> Key Strengths
                                </h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                                    {selectedReport.report?.strengths}
                                </p>
                            </div>

                            {/* Gaps */}
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: '#f59e0b' }}>⚠</span> Skill Gaps & Focus Areas
                                </h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                                    {selectedReport.report?.gaps}
                                </p>
                            </div>

                            {/* Skills Breakdown */}
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 8 }}>Matching Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {selectedReport.report?.matchedSkills?.length === 0 ? (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No matching skills found.</span>
                                    ) : (
                                        selectedReport.report?.matchedSkills?.map((s, i) => (
                                            <span key={i} className="skill-tag" style={{ background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-border)', fontSize: '0.75rem' }}>
                                                ✓ {s}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                            <button style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => setSelectedReport(null)}>Close Report</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resume Preview Modal */}
            {viewingResume && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="animate-fade-in" style={{
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
                        padding: '24px 24px', width: '100%', maxWidth: 800, height: '90vh', boxShadow: 'var(--card-shadow)',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', margin: 0 }}>Resume Preview</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                    {viewingResume.originalName}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <a 
                                    href={resumesAPI.viewUrl(viewingResume._id)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn-ghost" 
                                    style={{ padding: '6px 12px', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                    ↗️ Open in New Tab
                                </a>
                                <button onClick={() => setViewingResume(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, overflow: 'hidden' }}>
                            <iframe 
                                src={resumesAPI.viewUrl(viewingResume._id)} 
                                width="100%" 
                                height="100%" 
                                style={{ border: 'none' }}
                                title="Resume PDF Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Interview Modal */}
            {schedulingFor && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)', margin: 0 }}>Schedule Interview</h3>
                            <button onClick={() => setSchedulingFor(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
                        </div>
                        <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Date & Time *</label>
                                <input 
                                    type="datetime-local" 
                                    value={interviewForm.scheduledAt} 
                                    onChange={e => setInterviewForm(prev => ({ ...prev, scheduledAt: e.target.value }))} 
                                    className="input-light" 
                                    required 
                                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Interview Type *</label>
                                <select 
                                    value={interviewForm.type} 
                                    onChange={e => setInterviewForm(prev => ({ ...prev, type: e.target.value }))} 
                                    className="input-light" 
                                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                                >
                                    <option value="online">Online (Video Call)</option>
                                    <option value="phone">Phone Call</option>
                                    <option value="in-person">In-Person Office Visit</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                                    {interviewForm.type === 'online' ? 'Meeting Link (Google Meet / Zoom)' : interviewForm.type === 'phone' ? 'Phone Number to Call' : 'Office Location Address'}
                                </label>
                                <input 
                                    value={interviewForm.linkOrLocation} 
                                    onChange={e => setInterviewForm(prev => ({ ...prev, linkOrLocation: e.target.value }))} 
                                    className="input-light" 
                                    placeholder={interviewForm.type === 'online' ? 'https://meet.google.com/abc' : interviewForm.type === 'phone' ? '+1 234 567 8900' : '123 Main St, Tech City'} 
                                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Special Notes / Instructions</label>
                                <textarea 
                                    value={interviewForm.notes} 
                                    onChange={e => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))} 
                                    rows={3} 
                                    className="input-light" 
                                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }} 
                                    placeholder="Please bring a government ID / prepare a screen share..." 
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                <button type="button" onClick={() => setSchedulingFor(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="btn-green" style={{ padding: '8px 22px' }} disabled={submittingInterview}>
                                    {submittingInterview ? 'Scheduling...' : 'Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

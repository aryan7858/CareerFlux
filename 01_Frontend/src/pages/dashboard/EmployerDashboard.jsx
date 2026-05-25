import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiBriefcase, HiUserGroup, HiEye, HiPlus, HiTrash, HiPencil, HiArrowRight } from 'react-icons/hi';

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

const typeColors = {
    'full-time': { bg: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' },
    'remote': { bg: 'var(--stat-grn-bg)', color: 'var(--stat-grn-cl)' },
    'part-time': { bg: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)' },
    'contract': { bg: 'var(--stat-pur-bg)', color: 'var(--stat-pur-cl)' },
};

export default function EmployerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [assignedApps, setAssignedApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                jobsAPI.getEmployerJobs({ limit: 50 }),
                applicationsAPI.getAssignedApplications()
            ]);
            setJobs(jobsRes.data.jobs || []);
            setAssignedApps(appsRes.data.applications || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job posting?')) return;
        try { await jobsAPI.delete(id); setJobs(jobs.filter(j => j._id !== id)); toast.success('Job deleted'); }
        catch { toast.error('Failed to delete'); }
    };

    if (loading) return <><Navbar /><Loader /></>;

    const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
    const activeJobs = jobs.filter(j => j.isActive).length;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>
            <Navbar />
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 5% 80px' }}>

                {/* Header */}
                <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text)', marginBottom: 4 }}>
                            Employer Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your job postings and find the best talent</p>
                    </div>
                    <Link to="/employer/post-job" className="btn-green" style={{ textDecoration: 'none' }}>
                        <HiPlus /> Post New Job
                    </Link>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <StatCard icon={<HiBriefcase />} label="Total Jobs" value={jobs.length} bgVar="--stat-blue-bg" colorVar="--stat-blue-cl" />
                    <StatCard icon={<HiEye />} label="Active Listings" value={activeJobs} bgVar="--stat-grn-bg" colorVar="--stat-grn-cl" />
                    <StatCard icon={<HiUserGroup />} label="Total Applicants" value={totalApplications} bgVar="--stat-amb-bg" colorVar="--stat-amb-cl" />
                </div>

                {/* Jobs Table */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>All Job Postings</h2>
                        {jobs.length > 0 && (
                            <Link to="/employer/post-job" style={{ color: 'var(--green)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                Post new <HiArrowRight />
                            </Link>
                        )}
                    </div>

                    {jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <p style={{ fontSize: '3rem', marginBottom: 14 }}>📝</p>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', marginBottom: 8 }}>No job postings yet</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>Create your first job listing to start finding talent!</p>
                            <Link to="/employer/post-job" className="btn-green" style={{ textDecoration: 'none' }}>
                                <HiPlus /> Create First Job
                            </Link>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Job Title', 'Type', 'Status', 'Applicants', 'Posted By', 'Posted', 'Actions'].map((h, i) => (
                                            <th key={h} style={{ padding: '0 0 12px', textAlign: i === 6 ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map(job => {
                                        const tc = typeColors[job.type] || { bg: 'var(--tag-bg)', color: 'var(--tag-color)' };
                                        return (
                                            <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '14px 0', fontWeight: 600, color: 'var(--text)', maxWidth: 220 }}>
                                                    <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.title}</span>
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <span style={{ ...tc, padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{job.type}</span>
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: job.isActive ? 'var(--stat-grn-bg)' : 'rgba(239,68,68,0.12)', color: job.isActive ? 'var(--stat-grn-cl)' : '#ef4444' }}>
                                                        {job.isActive ? 'Active' : 'Closed'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <Link to={`/employer/jobs/${job._id}/applicants`} style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                                                        {job.applicationsCount || 0} applicants
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text)' }}>
                                                    {job.postedBy ? (
                                                        <>
                                                            <div style={{ fontWeight: 600 }}>{job.postedBy.firstName} {job.postedBy.lastName || ''}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.postedBy.companyName || job.postedBy.email}</div>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Platform</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                        <Link to={`/employer/edit-job/${job._id}`}
                                                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                            <HiPencil style={{ fontSize: 14 }} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(job._id)}
                                                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                            <HiTrash style={{ fontSize: 14 }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Assigned Applications Table */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)', marginTop: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>Applications Assigned to You</h2>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{assignedApps.length} assigned</span>
                    </div>

                    {assignedApps.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ fontSize: '2.5rem', marginBottom: 10 }}>📋</p>
                            <h3 style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem', marginBottom: 6 }}>No assigned applications</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>When other employers assign applications to you for analysis, they will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Applicant', 'Job Title', 'Status', 'Assigned Date', 'Actions'].map((h, i) => (
                                            <th key={h} style={{ padding: '0 0 12px', textAlign: i === 4 ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedApps.map(app => {
                                        return (
                                            <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '14px 0', fontWeight: 600, color: 'var(--text)' }}>
                                                    {app.applicant?.firstName} {app.applicant?.lastName || ''}
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text)' }}>
                                                    <div>{app.job?.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.job?.company}</div>
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold status-${app.status}`} style={{ textTransform: 'capitalize' }}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                                                    {new Date(app.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '14px 0', textAlign: 'right' }}>
                                                    <Link to={`/employer/jobs/${app.job?._id}/applicants`} className="btn-green" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        Review <HiArrowRight />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

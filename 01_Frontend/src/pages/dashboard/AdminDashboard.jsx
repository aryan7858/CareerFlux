import { useState, useEffect } from 'react';
import { adminAPI, resumesAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import StatsCard from '../../components/StatsCard';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiUserGroup, HiBriefcase, HiDocumentText, HiTrendingUp, HiTrash, HiShieldCheck, HiShieldExclamation } from 'react-icons/hi';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [verificationsLoading, setVerificationsLoading] = useState(false);
    const [viewingResume, setViewingResume] = useState(null);

    // Filters
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [appStatusFilter, setAppStatusFilter] = useState('all');

    useEffect(() => { fetchDashboard(); }, []);

    // Watch filters and fetch updated lists
    useEffect(() => {
        if (!loading) {
            fetchFilteredUsers();
        }
    }, [userRoleFilter]);

    useEffect(() => {
        if (!loading) {
            fetchFilteredApplications();
        }
    }, [appStatusFilter]);

    const fetchDashboard = async () => {
        try {
            const [statsRes, usersRes, jobsRes, appsRes] = await Promise.all([
                adminAPI.getStats(), 
                adminAPI.getUsers({ limit: 100 }), 
                adminAPI.getJobs({ limit: 100 }),
                adminAPI.getApplications({ limit: 100 })
            ]);
            setStats(statsRes.data.stats); 
            setUsers(usersRes.data.users); 
            setJobs(jobsRes.data.jobs);
            setApplications(appsRes.data.applications);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchFilteredUsers = async () => {
        try {
            const params = { limit: 100 };
            if (userRoleFilter !== 'all') params.role = userRoleFilter;
            const res = await adminAPI.getUsers(params);
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFilteredApplications = async () => {
        try {
            const params = { limit: 100 };
            if (appStatusFilter !== 'all') params.status = appStatusFilter;
            const res = await adminAPI.getApplications(params);
            setApplications(res.data.applications);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleUserStatus = async (id, isActive) => {
        try { await adminAPI.updateUserStatus(id, { isActive: !isActive }); setUsers(users.map(u => u._id === id ? { ...u, isActive: !isActive } : u)); toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`); }
        catch { toast.error('Failed to update user'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try { await adminAPI.deleteUser(id); setUsers(users.filter(u => u._id !== id)); toast.success('User deleted'); }
        catch { toast.error('Failed to delete user'); }
    };

    const deleteJob = async (id) => {
        if (!window.confirm('Delete this job posting?')) return;
        try { await adminAPI.deleteJob(id); setJobs(jobs.filter(j => j._id !== id)); toast.success('Job deleted'); }
        catch { toast.error('Failed to delete job'); }
    };

    const toggleJobStatus = async (id, isActive) => {
        try {
            await adminAPI.updateJobStatus(id, { isActive: !isActive });
            setJobs(jobs.map(j => j._id === id ? { ...j, isActive: !isActive } : j));
            toast.success(`Job status changed to ${!isActive ? 'Active' : 'Closed'}`);
        } catch (err) {
            toast.error('Failed to update job status');
        }
    };

    const deleteApplication = async (id) => {
        if (!window.confirm('Delete this application permanently?')) return;
        try {
            await adminAPI.deleteApplication(id);
            setApplications(applications.filter(a => a._id !== id));
            toast.success('Application deleted');
        } catch {
            toast.error('Failed to delete application');
        }
    };

    const [employerForm, setEmployerForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [creatingEmployer, setCreatingEmployer] = useState(false);

    const fetchPendingVerifications = async () => {
        setVerificationsLoading(true);
        try {
            const res = await adminAPI.getPendingVerifications();
            setPendingVerifications(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch pending verifications:', err);
        } finally {
            setVerificationsLoading(false);
        }
    };

    const handleReviewVerification = async (userId, status) => {
        try {
            await adminAPI.reviewVerification(userId, status);
            setPendingVerifications(pendingVerifications.filter(u => u._id !== userId));
            toast.success(`User verification status set to ${status}!`);
            fetchDashboard();
        } catch (err) {
            toast.error('Failed to update verification status.');
        }
    };

    const handleDownloadDoc = async (userId, name) => {
        try {
            const res = await adminAPI.downloadVerificationDoc(userId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Verification-${name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to download verification document.');
        }
    };

    useEffect(() => {
        if (activeTab === 'verifications') {
            fetchPendingVerifications();
        }
    }, [activeTab]);

    const handleFormChange = e => setEmployerForm({ ...employerForm, [e.target.name]: e.target.value });

    const handleCreateEmployer = async (e) => {
        e.preventDefault();
        if (employerForm.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setCreatingEmployer(true);
        try {
            const res = await adminAPI.createEmployer(employerForm);
            toast.success(res.data.message || 'Employer account created successfully!');
            setEmployerForm({ firstName: '', lastName: '', email: '', password: '' });
            
            // Refresh users
            const usersRes = await adminAPI.getUsers({ limit: 20 });
            setUsers(usersRes.data.users);
            
            // Go to Manage Users tab
            setActiveTab('users');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create employer');
        } finally {
            setCreatingEmployer(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 10,
        fontSize: '0.9rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.2s', background: 'var(--input-bg)'
    };

    if (loading) return <><Navbar /><Loader /></>;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: 'Manage Users' },
        { id: 'verifications', label: 'Manage Verifications' },
        { id: 'jobs', label: 'Manage Jobs' },
        { id: 'applications', label: 'Manage Applications' },
        { id: 'create-employer', label: 'Add Employer' }
    ];

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>
            <Navbar />
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 5% 80px' }}>
                <div className="animate-fade-in" style={{ marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text)', marginBottom: 4 }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Platform overview and management tools.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <StatsCard icon={<HiUserGroup />} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
                    <StatsCard icon={<HiBriefcase />} label="Total Jobs" value={stats?.totalJobs || 0} color="accent" />
                    <StatsCard icon={<HiDocumentText />} label="Applications" value={stats?.totalApplications || 0} color="amber" />
                    <StatsCard icon={<HiTrendingUp />} label="Active Jobs" value={stats?.activeJobs || 0} color="purple" />
                </div>

                {/* Tabs */}
                <div style={{ display: 'inline-flex', gap: 6, background: 'var(--surface)', borderRadius: 12, padding: 6, marginBottom: 24, border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                background: activeTab === tab.id ? 'var(--green-bg)' : 'transparent',
                                color: activeTab === tab.id ? '#16a34a' : 'var(--text-muted)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem', marginBottom: 20 }}>User Distribution</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[{ label: 'Job Seekers', role: 'jobseeker', value: stats?.totalJobseekers || 0, color: '#3b82f6' }, { label: 'Employers', role: 'employer', value: stats?.totalEmployers || 0, color: '#10b981' }].map((item) => (
                                    <div 
                                        key={item.label} 
                                        onClick={() => {
                                            setUserRoleFilter(item.role);
                                            setActiveTab('users');
                                        }}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            padding: '8px 12px',
                                            borderRadius: 8,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                                            <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
                                        </div>
                                        <span style={{ color: 'var(--text)', fontWeight: 800 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem', marginBottom: 20 }}>Application Status</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {(stats?.statusBreakdown || []).map((item) => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => {
                                            setAppStatusFilter(item._id);
                                            setActiveTab('applications');
                                        }}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            padding: '8px 12px',
                                            borderRadius: 8,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize' }}>{item._id}</span>
                                        <span style={{ color: 'var(--text)', fontWeight: 800 }}>{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem' }}>All Users ({users.length})</h3>
                            <select 
                                value={userRoleFilter} 
                                onChange={(e) => setUserRoleFilter(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'var(--text)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Roles</option>
                                <option value="jobseeker">Job Seekers</option>
                                <option value="employer">Employers</option>
                            </select>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h, i) => (
                                            <th key={h} style={{ padding: '0 0 12px', textAlign: i === 5 ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '14px 0', color: 'var(--text)' }}>
                                                <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                                                <div 
                                                    style={{ 
                                                        fontFamily: 'monospace', 
                                                        fontSize: '0.72rem', 
                                                        color: 'var(--text-faint)', 
                                                        cursor: 'pointer',
                                                        display: 'inline-block',
                                                        marginTop: 2
                                                    }}
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(u._id);
                                                        toast.success('User ID copied!');
                                                    }}
                                                    title="Click to copy User ID"
                                                >
                                                    ID: {u._id}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 0', color: 'var(--text-muted)' }}>{u.email}</td>
                                            <td style={{ padding: '14px 0' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', background: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 0' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: u.isActive ? 'var(--stat-grn-bg)' : 'rgba(239,68,68,0.12)', color: u.isActive ? 'var(--stat-grn-cl)' : '#ef4444' }}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 0', color: 'var(--text-faint)', fontSize: '0.78rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '14px 0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    <button onClick={() => toggleUserStatus(u._id, u.isActive)} title={u.isActive ? 'Deactivate' : 'Activate'}
                                                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#eab308'; e.currentTarget.style.color = '#eab308'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                        {u.isActive ? <HiShieldExclamation style={{ fontSize: 16 }} /> : <HiShieldCheck style={{ fontSize: 16 }} />}
                                                    </button>
                                                    <button onClick={() => deleteUser(u._id)}
                                                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                        <HiTrash style={{ fontSize: 16 }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem', marginBottom: 20 }}>All Jobs ({jobs.length})</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Title', 'Company', 'Type', 'Posted By', 'Status', 'Posted', 'Actions'].map((h, i) => (
                                            <th key={h} style={{ padding: '0 0 12px', textAlign: i === 6 ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '14px 0', fontWeight: 600, color: 'var(--text)' }}>
                                                <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.title}</span>
                                            </td>
                                            <td style={{ padding: '14px 0', color: 'var(--text-muted)' }}>{job.company}</td>
                                            <td style={{ padding: '14px 0' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize', background: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)' }}>
                                                    {job.type}
                                                </span>
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
                                            <td style={{ padding: '14px 0' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: job.isActive ? 'var(--stat-grn-bg)' : 'rgba(239,68,68,0.12)', color: job.isActive ? 'var(--stat-grn-cl)' : '#ef4444' }}>
                                                    {job.isActive ? 'Active' : 'Closed'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 0', color: 'var(--text-faint)', fontSize: '0.78rem' }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '14px 0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    <button onClick={() => toggleJobStatus(job._id, job.isActive)} title={job.isActive ? 'Close Job' : 'Reopen Job'}
                                                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#eab308'; e.currentTarget.style.color = '#eab308'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                        {job.isActive ? <HiShieldExclamation style={{ fontSize: 16 }} /> : <HiShieldCheck style={{ fontSize: 16 }} />}
                                                    </button>
                                                    <button onClick={() => deleteJob(job._id)}
                                                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                        <HiTrash style={{ fontSize: 16 }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Manage Applications Tab */}
                {activeTab === 'applications' && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem' }}>All Applications ({applications.length})</h3>
                            <select 
                                value={appStatusFilter} 
                                onChange={(e) => setAppStatusFilter(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'var(--text)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Applicant', 'Job Title & Company', 'Status', 'Applied Date', 'Actions'].map((h, i) => (
                                            <th key={h} style={{ padding: '0 0 12px', textAlign: i === 4 ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td>
                                        </tr>
                                    ) : (
                                        applications.map((app) => (
                                            <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '14px 0', color: 'var(--text)' }}>
                                                    {app.applicant ? (
                                                        <>
                                                            <div style={{ fontWeight: 600 }}>{app.applicant.firstName} {app.applicant.lastName || ''}</div>
                                                            <div 
                                                                style={{ 
                                                                    fontFamily: 'monospace', 
                                                                    fontSize: '0.72rem', 
                                                                    color: 'var(--text-faint)', 
                                                                    cursor: 'pointer',
                                                                    marginTop: 2
                                                                }}
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(app.applicant._id);
                                                                    toast.success('User ID copied!');
                                                                }}
                                                                title="Click to copy User ID"
                                                            >
                                                                ID: {app.applicant._id}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{app.applicant.email}</div>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Unknown User</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text)' }}>
                                                    {app.job ? (
                                                        <>
                                                            <div style={{ fontWeight: 600 }}>{app.job.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.job.company}</div>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Job Unavailable</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold status-${app.status}`} style={{ textTransform: 'capitalize' }}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text-faint)', fontSize: '0.78rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                                                        {app.resume && (
                                                            <button 
                                                                onClick={() => setViewingResume(app.resume)}
                                                                className="btn-ghost" 
                                                                style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                            >
                                                                👁️ Resume
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteApplication(app._id)}
                                                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                                            <HiTrash style={{ fontSize: 16 }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Employer Tab */}
                {activeTab === 'create-employer' && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, boxShadow: 'var(--card-shadow)', maxWidth: 500, margin: '0 auto' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.25rem', marginBottom: 6 }}>Create Employer Account</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Directly register an approved employer account. They will be able to log in immediately using these credentials.</p>
                        
                        <form onSubmit={handleCreateEmployer} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>First Name</label>
                                <input type="text" name="firstName" value={employerForm.firstName} onChange={handleFormChange} required placeholder="e.g. John"
                                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Last Name</label>
                                <input type="text" name="lastName" value={employerForm.lastName} onChange={handleFormChange} required placeholder="e.g. Doe"
                                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Email Address</label>
                                <input type="email" name="email" value={employerForm.email} onChange={handleFormChange} required placeholder="e.g. employer@company.com"
                                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
                                <input type="password" name="password" value={employerForm.password} onChange={handleFormChange} required placeholder="Min. 8 characters"
                                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                            </div>
                            
                            <button type="submit" disabled={creatingEmployer} className="btn-green" style={{ marginTop: 8, padding: '0.85rem', justifyContent: 'center', fontSize: '0.9rem', borderRadius: 10, cursor: 'pointer' }}>
                                {creatingEmployer ? 'Creating account...' : 'Create Employer'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Manage Verifications Tab */}
                {activeTab === 'verifications' && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem', marginBottom: 20 }}>Pending Profile Verifications ({pendingVerifications.length})</h3>
                        {verificationsLoading ? (
                            <Loader text="Loading requests..." />
                        ) : pendingVerifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <p style={{ fontSize: '3rem', marginBottom: 12 }}>🛡️</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No pending verification requests.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            {['Name', 'Email', 'Role', 'Company / Industry', 'Document', 'Actions'].map((h, i) => (
                                                <th key={h} style={{ padding: '0 0 12px', textAlign: i === 5 ? 'right' : 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingVerifications.map((u) => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '14px 0', fontWeight: 600, color: 'var(--text)' }}>{u.firstName} {u.lastName || ''}</td>
                                                <td style={{ padding: '14px 0', color: 'var(--text-muted)' }}>{u.email}</td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', background: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 0', color: 'var(--text)' }}>
                                                    {u.role === 'employer' ? (
                                                        <>
                                                            <div style={{ fontWeight: 600 }}>{u.companyName || 'N/A'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.industry || 'N/A'}</div>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Candidate</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <button 
                                                        onClick={() => handleDownloadDoc(u._id, `${u.firstName}-${u.lastName || 'User'}`)}
                                                        className="btn-ghost" 
                                                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                    >
                                                        📥 Download ID Doc
                                                    </button>
                                                </td>
                                                <td style={{ padding: '14px 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                        <button 
                                                            onClick={() => handleReviewVerification(u._id, 'verified')}
                                                            className="btn-green" 
                                                            style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700 }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReviewVerification(u._id, 'rejected')}
                                                            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
        </div>
    );
}

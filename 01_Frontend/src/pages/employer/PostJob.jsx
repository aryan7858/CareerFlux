import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi';

const types = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const levels = ['entry', 'mid', 'senior', 'lead', 'executive'];
const categories = ['Technology', 'Finance', 'Design', 'Marketing', 'Healthcare', 'Engineering', 'Education', 'Legal', 'Other'];

export default function PostJob() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const isEditing = !!jobId;

    const [isLoadingJob, setIsLoadingJob] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', company: '', location: '',
        type: 'full-time', category: 'Technology', experienceLevel: 'mid',
        salaryMin: '', salaryMax: '', requirements: '', skills: '', applicationDeadline: '',
    });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    useEffect(() => {
        if (isEditing) {
            jobsAPI.getById(jobId)
                .then(res => {
                    const j = res.data.job;
                    setForm({
                        title: j.title || '',
                        description: j.description || '',
                        company: j.company || '',
                        location: j.location || '',
                        type: j.type || 'full-time',
                        category: j.category || 'Technology',
                        experienceLevel: j.experienceLevel || 'mid',
                        salaryMin: j.salary?.min || '',
                        salaryMax: j.salary?.max || '',
                        requirements: j.requirements?.join('\n') || '',
                        skills: j.skills?.join(', ') || '',
                        applicationDeadline: j.applicationDeadline ? new Date(j.applicationDeadline).toISOString().split('T')[0] : '',
                    });
                })
                .catch(() => toast.error('Failed to load job details'))
                .finally(() => setIsLoadingJob(false));
        }
    }, [jobId, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                title: form.title, description: form.description, company: form.company, location: form.location,
                type: form.type, category: form.category, experienceLevel: form.experienceLevel,
                salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0 },
                requirements: form.requirements.split('\n').filter(Boolean),
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                applicationDeadline: form.applicationDeadline || undefined,
            };

            if (isEditing) {
                await jobsAPI.update(jobId, payload);
                toast.success('Job updated successfully!');
            } else {
                await jobsAPI.create(payload);
                toast.success('Job posted successfully!');
            }
            navigate('/employer/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to process request'); }
        finally { setSubmitting(false); }
    };

    return (
        <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Navbar />
            
            {/* Background decorative blobs */}
            <div style={{ position: 'fixed', top: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

            <div className="pt-24 pb-16 px-[5%] w-full mx-auto relative z-10" style={{ maxWidth: '1600px' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <HiArrowLeft /> Back to Dashboard
                </button>

                <div className="animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative' }}>
                    
                    {/* Header gradient banner inside the card */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #22c55e)' }} />
                    
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                            {isEditing ? 'Edit' : 'Post a'} <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{isEditing ? 'Job Listing' : 'New Job'}</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{isEditing ? 'Update the details for your existing job posting.' : 'Find the perfect candidate by providing clear and attractive job details.'}</p>
                    </div>

                    {isLoadingJob ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading job details...</div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Job Title *</label>
                                <input type="text" required value={form.title} onChange={set('title')} className="input-light" placeholder="e.g. Senior Visual Designer" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Company Name *</label>
                                <input type="text" required value={form.company} onChange={set('company')} className="input-light" placeholder="e.g. FluxTech" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Location *</label>
                                <input type="text" required value={form.location} onChange={set('location')} className="input-light" placeholder="Remote, NYC" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Job Type</label>
                                <select value={form.type} onChange={set('type')} className="input-light" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}>
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Experience Level</label>
                                <select value={form.experienceLevel} onChange={set('experienceLevel')} className="input-light" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}>
                                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Category</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {categories.map(c => (
                                    <button 
                                        key={c} type="button" 
                                        onClick={() => setForm({ ...form, category: c })} 
                                        style={{ 
                                            padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                            background: form.category === c ? 'var(--text)' : 'var(--bg)', 
                                            color: form.category === c ? 'var(--bg)' : 'var(--text-muted)', 
                                            border: `1px solid ${form.category === c ? 'var(--text)' : 'var(--border)'}` 
                                        }}
                                        onMouseEnter={e => { if(form.category !== c) { e.target.style.borderColor = 'var(--text-faint)'; e.target.style.color = 'var(--text)'; } }}
                                        onMouseLeave={e => { if(form.category !== c) { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; } }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Description *</label>
                            <textarea required value={form.description} onChange={set('description')} rows={6} className="input-light" placeholder="Describe the role, responsibilities..." style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', resize: 'vertical', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#ec4899'; e.target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Salary Min ($)</label>
                                <input type="number" value={form.salaryMin} onChange={set('salaryMin')} className="input-light" placeholder="60000" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Salary Max ($)</label>
                                <input type="number" value={form.salaryMax} onChange={set('salaryMax')} className="input-light" placeholder="120000" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Requirements (one per line)</label>
                            <textarea value={form.requirements} onChange={set('requirements')} rows={4} className="input-light" placeholder={"3+ years React experience\nFamiliarity with REST APIs"} style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', resize: 'vertical', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 0 4px rgba(6, 182, 212, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Skills (comma-separated)</label>
                                <input type="text" value={form.skills} onChange={set('skills')} className="input-light" placeholder="React, Node.js, TypeScript" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Application Deadline</label>
                                <input type="date" value={form.applicationDeadline} onChange={set('applicationDeadline')} className="input-light" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #22c55e, #10b981)', color: '#fff', fontSize: '1.1rem', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(34,197,94,0.25)' }} onMouseEnter={e => { if(!submitting) e.target.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { if(!submitting) e.target.style.transform = 'translateY(0)' }}>
                                {submitting ? `${isEditing ? 'Updating' : 'Publishing'} Job...` : `${isEditing ? 'Save Changes' : 'Publish Job Listing 🎉'}`}
                            </button>
                        </div>
                    </form>
                    )}
                </div>
            </div>
        </div>
    );
}

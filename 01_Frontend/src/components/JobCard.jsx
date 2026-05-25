import { Link } from 'react-router-dom';
import { HiLocationMarker, HiUsers, HiCheckCircle, HiExternalLink } from 'react-icons/hi';

const typeColors = {
    'full-time': { bg: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' },
    'part-time': { bg: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)' },
    'remote': { bg: 'var(--stat-grn-bg)', color: 'var(--stat-grn-cl)' },
    'contract': { bg: 'var(--stat-pur-bg)', color: 'var(--stat-pur-cl)' },
    'internship': { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
};

function CompanyLogo({ name, url }) {
    if (url && url.startsWith('http')) {
        return (
            <div style={{ width: 46, height: 46, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
            </div>
        );
    }

    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
    return (
        <div style={{ width: 46, height: 46, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{name?.[0]?.toUpperCase() || '?'}</span>
        </div>
    );
}

function stripHtml(html) {
    if (!html) return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    } catch (e) {
        return html.replace(/<[^>]*>/g, '');
    }
}

export default function JobCard({ job }) {
    const typeStyle = typeColors[job.type] || { bg: 'var(--tag-bg)', color: 'var(--tag-color)' };
    const skills = job.skills?.slice(0, 3) || [];
    const isExternal = job.isExternal || !!job.externalApplyUrl;

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, transition: 'transform 0.22s, border-color 0.22s, box-shadow 0.22s', boxShadow: 'var(--card-shadow)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--card-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                    <CompanyLogo name={job.company?.name || job.company} url={job.postedBy?.companyLogoUrl} />
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>{job.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>{job.company?.name || job.company}</span>
                            {(job.company?.isVerified || job.postedBy?.isVerified) && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', fontWeight: 500, color: 'var(--stat-blue-cl)', background: 'var(--stat-blue-bg)', padding: '2px 8px', borderRadius: 99 }}>
                                    <HiCheckCircle /> Verified
                                </span>
                            )}
                            {job.location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                                    <HiLocationMarker /> {job.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {job.applicationCount > 0 && !isExternal && (
                    <span style={{ background: 'var(--green-bg)', color: '#22c55e', fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap', border: '1px solid var(--green-border)' }}>
                        {job.applicationCount} applicants
                    </span>
                )}
            </div>

            {/* Description */}
            {job.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {stripHtml(job.description)}
                </p>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {skills.map(s => (
                        <span key={s} style={{ background: 'var(--tag-bg)', color: 'var(--tag-color)', border: '1px solid var(--border)', padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500 }}>{s}</span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ ...typeStyle, padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{job.type}</span>
                    {job.experienceLevel && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-faint)', fontSize: '0.78rem' }}><HiUsers /> {job.experienceLevel}</span>
                    )}
                    {job.salary?.min && (
                        <span style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600 }}>
                            {job.salary.currency === 'USD' ? '$' : ''}{job.salary.min.toLocaleString()}–{job.salary.max?.toLocaleString() || '?'}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/yr</span>
                        </span>
                    )}
                </div>
                {isExternal ? (
                    <a href={job.externalApplyUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-green" style={{ textDecoration: 'none', padding: '0.45rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Apply Externally <HiExternalLink />
                    </a>
                ) : (
                    <Link to={`/jobs/${job._id}`} className="btn-green" style={{ textDecoration: 'none', padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}>Apply now</Link>
                )}
            </div>
        </div>
    );
}

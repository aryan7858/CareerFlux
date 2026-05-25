import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import { HiSearch, HiLocationMarker, HiAdjustments, HiX } from 'react-icons/hi';

const jobTypes = [
    { value: 'full-time', label: 'Full-time job', count: 620 },
    { value: 'part-time', label: 'Part-time job', count: 232 },
    { value: 'remote', label: 'Remote', count: 1872 },
    { value: 'internship', label: 'Internship', count: 541 },
    { value: 'contract', label: 'Contract', count: 1121 },
];
const expLevels = [
    { value: 'entry', label: 'Entry level', count: 1028 },
    { value: 'mid', label: 'Intermediate', count: 902 },
    { value: 'senior', label: 'Senior', count: 450 },
    { value: 'lead', label: 'Expert', count: 106 },
];
const categories = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Legal'];
const industries = ['Software / Tech', 'Finance / Banking', 'Healthcare', 'Education', 'Marketing / Advertising', 'Legal Services', 'Manufacturing', 'Retail', 'Consulting'];

export default function Jobs() {
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        experienceLevel: searchParams.get('experienceLevel') || '',
        location: searchParams.get('location') || '',
        industry: '',
        experienceRecommend: false,
        skillsMatch: false,
    });
    const [sortBy, setSortBy] = useState('newest');
    const [mobileSidebar, setMobileSidebar] = useState(false);

    const fetchJobs = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (filters.type) params.type = filters.type;
            if (filters.category) params.category = filters.category;
            if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
            if (filters.location) params.location = filters.location;
            if (filters.industry) params.industry = filters.industry;
            if (filters.experienceRecommend) params.experienceRecommend = true;
            if (filters.skillsMatch) params.skillsMatch = true;
            const res = await jobsAPI.getAll(params);
            setJobs(res.data.jobs || []);
            setPagination(res.data.pagination || {});
        } catch (err) { console.error(err); setJobs([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchJobs(1); };
    const toggleType = (val) => setFilters(f => ({ ...f, type: f.type === val ? '' : val }));
    const toggleExp = (val) => setFilters(f => ({ ...f, experienceLevel: f.experienceLevel === val ? '' : val }));
        const clearAll = () => { 
        setSearch(''); 
        setLocationInput(''); 
        setFilters({ 
            type: '', 
            category: '', 
            experienceLevel: '', 
            location: '', 
            industry: '', 
            experienceRecommend: false, 
            skillsMatch: false 
        }); 
    };

    const activeFiltersCount = [
        filters.type, 
        filters.category, 
        filters.experienceLevel, 
        filters.location, 
        filters.industry,
        filters.experienceRecommend ? 'recommend' : '',
        filters.skillsMatch ? 'skills' : ''
    ].filter(Boolean).length;

    const renderSidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>Filter</p>
                <button onClick={clearAll} style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit' }}>Reset</button>
            </div>
            <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginBottom: 12 }}>Categories</p>
                <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid var(--border)`, borderRadius: 8, fontSize: '0.85rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', background: 'var(--input-bg)' }}>
                    <option value="">Select categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginBottom: 12 }}>Industries</p>
                <select value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid var(--border)`, borderRadius: 8, fontSize: '0.85rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', background: 'var(--input-bg)' }}>
                    <option value="">Select industry</option>
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
            </div>
            <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginBottom: 12 }}>Experience level</p>
                {expLevels.map(l => (
                    <label key={l.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="checkbox" checked={filters.experienceLevel === l.value} onChange={() => toggleExp(l.value)} style={{ width: 16, height: 16, accentColor: '#22c55e', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{l.label}</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{l.count}</span>
                    </label>
                ))}
            </div>
            <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginBottom: 12 }}>Job type</p>
                {jobTypes.map(t => (
                    <label key={t.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="checkbox" checked={filters.type === t.value} onChange={() => toggleType(t.value)} style={{ width: 16, height: 16, accentColor: '#22c55e', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{t.label}</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{t.count}</span>
                    </label>
                ))}
            </div>
            <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginBottom: 12 }}>Location</p>
                <input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Remote, New York"
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid var(--border)`, borderRadius: 8, fontSize: '0.85rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', background: 'var(--input-bg)' }}
                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            {isAuthenticated && (
                <div style={{ background: 'linear-gradient(135deg, var(--green-bg), rgba(34, 197, 94, 0.02))', border: '1px solid var(--green-border)', borderRadius: 10, padding: 12 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.8rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        ✨ AI Smart Filters
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.experienceRecommend} onChange={e => setFilters(f => ({ ...f, experienceRecommend: e.target.checked }))} style={{ width: 15, height: 15, accentColor: '#22c55e', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text)' }}>Fit my experience</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.skillsMatch} onChange={e => setFilters(f => ({ ...f, skillsMatch: e.target.checked }))} style={{ width: 15, height: 15, accentColor: '#22c55e', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text)' }}>Fit my skills</span>
                    </label>
                </div>
            )}
            <button onClick={() => { fetchJobs(1); setMobileSidebar(false); }} className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>Apply Filters</button>
        </div>
    );

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s' }}>
            <Navbar />

            <section style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '40px 5%' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'var(--text)', marginBottom: 6 }}>Find Jobs</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Discover opportunities waiting for you</p>
                    <form onSubmit={handleSearch} style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, boxShadow: 'var(--card-shadow)', overflow: 'hidden', border: `1px solid var(--border)`, maxWidth: 780 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderRight: `1px solid var(--border)` }}>
                            <HiSearch style={{ color: 'var(--text-faint)', fontSize: 18, flexShrink: 0 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Job title, company, keyword..."
                                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', color: 'var(--text)', fontFamily: 'inherit', padding: '14px 0', background: 'transparent' }} />
                            {search && <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18 }}><HiX /></button>}
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
                            <HiLocationMarker style={{ color: 'var(--text-faint)', fontSize: 18, flexShrink: 0 }} />
                            <input value={locationInput} onChange={e => { setLocationInput(e.target.value); setFilters(f => ({ ...f, location: e.target.value })); }} placeholder="Country or timezone"
                                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', color: 'var(--text)', fontFamily: 'inherit', padding: '14px 0', background: 'transparent' }} />
                        </div>
                        <button type="submit" style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '0 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.target.style.background = '#22c55e'}
                            onMouseLeave={e => e.target.style.background = 'var(--text)'}>
                            Search
                        </button>
                    </form>
                </div>
            </section>

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 5% 80px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                <aside style={{ width: 260, flexShrink: 0, background: 'var(--surface)', border: `1px solid var(--border)`, borderRadius: 14, padding: 24, position: 'sticky', top: 88, transition: 'background 0.2s', transform: 'translateZ(0)', willChange: 'transform' }} className="hidden md:block">
                    {renderSidebarContent()}
                </aside>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                            {loading ? 'Loading...' : `Showing results (${pagination.total || jobs.length})`}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="md:hidden" onClick={() => setMobileSidebar(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: `1.5px solid var(--border)`, borderRadius: 8, background: 'var(--surface)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text)' }}>
                                <HiAdjustments />
                                Filters {activeFiltersCount > 0 && <span style={{ background: '#22c55e', color: '#fff', borderRadius: 99, width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{activeFiltersCount}</span>}
                            </button>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                style={{ padding: '8px 14px', border: `1.5px solid var(--border)`, borderRadius: 8, fontSize: '0.85rem', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', background: 'var(--surface)' }}>
                                <option value="newest">Sort: Newest</option>
                                <option value="salary">Sort: Salary</option>
                                <option value="relevant">Sort: Relevant</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <Loader text="Searching for jobs..." />
                    ) : jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <p style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</p>
                            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.2rem', marginBottom: 8 }}>No Jobs Found</h3>
                            <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
                            <button onClick={clearAll} className="btn-green" style={{ marginTop: 24 }}>Clear All Filters</button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {jobs.map(job => <JobCard key={job._id} job={job} />)}
                            </div>
                            {pagination.pages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => fetchJobs(p)}
                                            style={{ width: 38, height: 38, borderRadius: 8, border: p === pagination.page ? 'none' : `1.5px solid var(--border)`, background: p === pagination.page ? '#22c55e' : 'var(--surface)', color: p === pagination.page ? '#fff' : 'var(--text)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {mobileSidebar && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileSidebar(false)}>
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, background: 'var(--surface)', padding: 24, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Filters</p>
                            <button onClick={() => setMobileSidebar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text)' }}><HiX /></button>
                        </div>
                        {renderSidebarContent()}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

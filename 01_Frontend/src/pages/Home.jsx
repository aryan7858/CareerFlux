import { Link, useNavigate } from 'react-router-dom';
import { Web3MediaHero } from '@/components/ui/web3media-hero';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    HiArrowRight, HiCode, HiTrendingUp, HiColorSwatch, HiSpeakerphone,
    HiAcademicCap, HiCheckCircle, HiUserGroup, HiLightningBolt, HiShieldCheck,
} from 'react-icons/hi';

const categories = [
    { icon: <HiCode />, name: 'Design & Development', count: '2,340', color: 'var(--stat-blue-bg)', iconColor: 'var(--stat-blue-cl)' },
    { icon: <HiSpeakerphone />, name: 'Marketing & Sales', count: '1,560', color: 'var(--stat-grn-bg)', iconColor: 'var(--stat-grn-cl)' },
    { icon: <HiTrendingUp />, name: 'Business & Finance', count: '2,216', color: 'var(--stat-amb-bg)', iconColor: 'var(--stat-amb-cl)' },
    { icon: <HiLightningBolt />, name: 'Business Development', count: '980', color: 'var(--stat-pur-bg)', iconColor: 'var(--stat-pur-cl)' },
    { icon: <HiColorSwatch />, name: 'Programming & Code', count: '2,340', color: 'var(--stat-blue-bg)', iconColor: 'var(--stat-blue-cl)' },
    { icon: <HiUserGroup />, name: 'Video & 3D Work', count: '2,340', color: 'var(--stat-grn-bg)', iconColor: 'var(--stat-grn-cl)' },
    { icon: <HiAcademicCap />, name: 'Art & Animation', count: '2,340', color: 'var(--stat-amb-bg)', iconColor: 'var(--stat-amb-cl)' },
];

const steps = [
    { icon: <HiCheckCircle />, color: '#22c55e', title: 'Create Account', desc: 'Easy to open an account and start your journey.' },
    { icon: <HiUserGroup />, color: '#3b82f6', title: 'Complete your profile', desc: 'Complete your profile with all the info to get attention of client.' },
    { icon: <HiArrowRight />, color: '#f59e0b', title: 'Apply job or hire', desc: 'Apply & get your preferable jobs with all the requirements and get it.' },
];

const companies = [
    { name: 'Google', color: '#4285F4', jobs: 12 },
    { name: 'Medium', color: '#00ab6c', jobs: 5 },
    { name: 'LinkedIn', color: '#0077b5', jobs: 10 },
    { name: "McDonald's", color: '#d00', jobs: 7 },
    { name: 'Airbnb', color: '#FF5A5F', jobs: 4 },
    { name: 'Slack', color: '#4A154B', jobs: 8 },
];

/* ── Outline SVG icon for the floating orbs ──────────────────── */
function FloatIcon({ path, size = 32, color = '#22c55e' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d={path} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* Brand name text — color adapts via CSS currentColor */
function BrandText({ name, width = 80 }) {
    return (
        <svg width={width} height={24} viewBox={`0 0 ${width} 24`}>
            <text x="0" y="18" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Outfit, sans-serif">{name}</text>
        </svg>
    );
}

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>

            {/* Navbar sits on top — Web3MediaHero navigation prop is left empty */}
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <Web3MediaHero
                logo="CareerFlux"
                navigation={[]}
                title="Find & Land Your Dream"
                highlightedText="Career Today"
                subtitle="Thousands of verified job listings from top companies worldwide. Your next opportunity is just one application away."
                ctaButton={{
                    label: 'Browse all jobs →',
                    onClick: () => navigate('/jobs'),
                }}
                cryptoIcons={[
                    {
                        icon: <FloatIcon path="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-9 7H7m4-4H7m10 2h.01" color="#22c55e" />,
                        label: 'Design', position: { x: '7%', y: '20%' },
                    },
                    {
                        icon: <FloatIcon path="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" color="#3b82f6" />,
                        label: 'Marketing', position: { x: '11%', y: '65%' },
                    },
                    {
                        icon: <FloatIcon path="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" color="#8b5cf6" />,
                        label: 'Remote', position: { x: '78%', y: '22%' },
                    },
                    {
                        icon: <FloatIcon path="M13 10V3L4 14h7v7l9-11h-7z" color="#f59e0b" />,
                        label: 'Startup', position: { x: '73%', y: '68%' },
                    },
                ]}
                trustedByText="Trusted by top companies"
                brands={[
                    { name: 'Google', logo: <BrandText name="Google" width={72} /> },
                    { name: 'Microsoft', logo: <BrandText name="Microsoft" width={90} /> },
                    { name: 'Amazon', logo: <BrandText name="Amazon" width={72} /> },
                    { name: 'Netflix', logo: <BrandText name="Netflix" width={70} /> },
                    { name: 'Airbnb', logo: <BrandText name="Airbnb" width={66} /> },
                    { name: 'Shopify', logo: <BrandText name="Shopify" width={72} /> },
                ]}
            />

            {/* ── CATEGORIES ───────────────────────────────────────────────── */}
            <section style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <p className="section-label">Categories</p>
                        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--text)', lineHeight: 1.15 }}>Most Demanding Categories.</h2>
                    </div>
                    <Link to="/jobs" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>All Categories <HiArrowRight /></Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {categories.map(cat => (
                        <Link key={cat.name} to={`/jobs?category=${cat.name}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, transition: 'all 0.22s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: cat.iconColor }}>{cat.icon}</div>
                            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.3 }}>{cat.name}</p>
                            <p style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>{cat.count} vacancy</p>
                        </Link>
                    ))}
                    <div style={{ background: '#22c55e', borderRadius: 12, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16, minHeight: 160 }}>
                        <p style={{ fontWeight: 800, fontSize: '2rem', color: '#fff', lineHeight: 1.1 }}>13k+</p>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500 }}>Jobs already posted</p>
                        <Link to="/jobs" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', fontSize: 18 }}><HiArrowRight /></Link>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section style={{ padding: '80px 5%', background: 'var(--bg-subtle)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <p className="section-label">Process</p>
                        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--text)' }}>How it works?</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
                        {steps.map(step => (
                            <div key={step.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 32, textAlign: 'center', transition: 'all 0.22s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${step.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: step.color }}>{step.icon}</div>
                                <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem', marginBottom: 10 }}>{step.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY CAREERFLUX ───────────────────────────────────────────── */}
            <section style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
                    <div>
                        <p className="section-label">Why choose us?</p>
                        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--text)', lineHeight: 1.15, marginBottom: 32 }}>World of talent at your fingertips</h2>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {[{ title: 'Seamless Search', desc: 'It only takes 5 minutes. Set-up is smooth and simple, with fully customisable features.' },
                            { title: 'Hire top talents', desc: 'Build your team with the best professionals across every field and experience level.' },
                            { title: 'Protected & verified listings', desc: 'Every job is reviewed before it goes live — safe and transparent for everyone.' }].map((item, i) => (
                                <details key={item.title} style={{ borderBottom: '1px solid var(--border)', padding: '18px 0' }} open={i === 0}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {item.title} <span style={{ color: '#22c55e', fontSize: 18 }}>+</span>
                                    </summary>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 10, lineHeight: 1.7 }}>{item.desc}</p>
                                </details>
                            ))}
                        </div>
                        <Link to="/register" className="btn-green" style={{ textDecoration: 'none', marginTop: 28, display: 'inline-flex' }}>Learn more <HiArrowRight /></Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[{ icon: <HiShieldCheck />, color: 'var(--stat-grn-bg)', iconColor: 'var(--stat-grn-cl)', title: 'Secure & Private', desc: 'Your data is encrypted and safe.' },
                        { icon: <HiLightningBolt />, color: 'var(--stat-blue-bg)', iconColor: 'var(--stat-blue-cl)', title: 'Fast Apply', desc: 'One-click applications.' },
                        { icon: <HiUserGroup />, color: 'var(--stat-amb-bg)', iconColor: 'var(--stat-amb-cl)', title: 'Top Companies', desc: 'Industry leaders & startups.' },
                        { icon: <HiCheckCircle />, color: 'var(--stat-pur-bg)', iconColor: 'var(--stat-pur-cl)', title: 'Verified Jobs', desc: 'Every listing is reviewed.' }].map(f => (
                            <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, transition: 'all 0.22s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: f.iconColor, marginBottom: 12 }}>{f.icon}</div>
                                <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 6 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TOP COMPANIES ────────────────────────────────────────────── */}
            <section style={{ padding: '80px 5%', background: 'var(--bg-subtle)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <p className="section-label">Companies</p>
                            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--text)' }}>Top Companies</h2>
                        </div>
                        <Link to="/jobs" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}>Explore More <HiArrowRight /></Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        {companies.map(c => (
                            <Link key={c.name} to={`/jobs?search=${encodeURIComponent(c.name)}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, textAlign: 'center', transition: 'all 0.22s', textDecoration: 'none', display: 'block' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                                <div style={{ width: 52, height: 52, borderRadius: 12, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>{c.name[0]}</div>
                                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem', marginBottom: 4 }}>{c.name}</p>
                                <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem', marginBottom: 14 }}>New York, Seattle...</p>
                                <span style={{ background: 'var(--green-bg)', color: '#22c55e', border: '1px solid var(--green-border)', borderRadius: 99, padding: '3px 12px', fontSize: '0.72rem', fontWeight: 600 }}>{c.jobs} open jobs</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BAND ─────────────────────────────────────────────────── */}
            <section style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderRadius: 20, padding: '56px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                    <div>
                        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#fff', marginBottom: 12 }}>Ready to Take the Next Step?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: 480 }}>Whether you're looking for your dream job or the perfect candidate, CareerFlux has you covered.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                        <Link to="/register" style={{ background: '#fff', color: '#16a34a', textDecoration: 'none', padding: '0.75rem 1.8rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            Get Started <HiArrowRight />
                        </Link>
                        <Link to="/jobs" style={{ border: '2px solid rgba(255,255,255,0.5)', color: '#fff', textDecoration: 'none', padding: '0.75rem 1.8rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; }}>
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

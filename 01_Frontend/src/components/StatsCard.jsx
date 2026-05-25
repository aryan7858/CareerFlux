export default function StatsCard({ icon, label, value, color = 'blue' }) {
    const iconStyles = {
        blue: { bg: 'var(--stat-blue-bg)', color: 'var(--stat-blue-cl)' },
        accent: { bg: 'var(--stat-grn-bg)', color: 'var(--stat-grn-cl)' },
        amber: { bg: 'var(--stat-amb-bg)', color: 'var(--stat-amb-cl)' },
        purple: { bg: 'var(--stat-pur-bg)', color: 'var(--stat-pur-cl)' },
    };

    const currentStyle = iconStyles[color] || iconStyles.blue;

    return (
        <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
            padding: 20, display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: 'var(--card-shadow)', transition: 'transform 0.2s'
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: currentStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: currentStyle.color, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1 }}>{value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>{label}</p>
            </div>
        </div>
    );
}

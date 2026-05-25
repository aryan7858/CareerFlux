import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Web3MediaHero({
    logo = "CareerFlux",
    navigation = [],
    contactButton,
    title,
    highlightedText = "Career Today",
    subtitle,
    ctaButton,
    cryptoIcons = [],
    trustedByText = "Trusted by",
    brands = [],
    className,
    children,
}) {
    return (
        <section
            className={cn(
                "relative w-full min-h-screen flex flex-col overflow-hidden",
                className
            )}
            style={{ background: "var(--hero-bg)", transition: "background 0.2s" }}
            role="banner"
            aria-label="Hero section"
        >
            {/* Radial green glow */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute"
                    style={{
                        width: "900px",
                        height: "900px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -55%)",
                        background:
                            "radial-gradient(circle, rgba(34,197,94,0.13) 0%, rgba(34,197,94,0) 70%)",
                        filter: "blur(80px)",
                    }}
                />
                {/* subtle grid pattern */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
            `,
                        backgroundSize: "60px 60px",
                        opacity: 0.4,
                    }}
                />
            </div>

            {/* Optional built-in header (hidden when navigation is empty) */}
            {(navigation.length > 0 || contactButton) && (
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-20 flex flex-row justify-between items-center px-8 lg:px-16"
                    style={{
                        paddingTop: "20px",
                        paddingBottom: "20px",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "Outfit, sans-serif",
                            fontWeight: 800,
                            fontSize: "20px",
                            color: "var(--text)",
                        }}
                    >
                        <span style={{ fontWeight: 400 }}>{logo.split(" ")[0]}</span>
                        <span style={{ color: "#22c55e" }}>{logo.split(" ")[1] || ""}</span>
                    </div>

                    <nav
                        className="hidden lg:flex flex-row items-center gap-8"
                        aria-label="Main navigation"
                    >
                        {navigation.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                style={{
                                    fontFamily: "Outfit, sans-serif",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: "var(--text-muted)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "color 0.15s",
                                }}
                                onMouseEnter={(e) => (e.target.style.color = "#22c55e")}
                                onMouseLeave={(e) =>
                                    (e.target.style.color = "var(--text-muted)")
                                }
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {contactButton && (
                        <button
                            onClick={contactButton.onClick}
                            style={{
                                padding: "8px 20px",
                                borderRadius: 99,
                                background: "transparent",
                                border: "1.5px solid var(--border)",
                                fontFamily: "Outfit, sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "var(--text)",
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#22c55e";
                                e.currentTarget.style.color = "#22c55e";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.color = "var(--text)";
                            }}
                        >
                            {contactButton.label}
                        </button>
                    )}
                </motion.header>
            )}

            {/* Main Content */}
            {children ? (
                <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                    {children}
                </div>
            ) : (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
                    {/* Floating Role Icons */}
                    {cryptoIcons.map((item, index) => (
                        <motion.div
                            key={index}
                            className="absolute flex flex-col items-center gap-2"
                            style={{
                                left: item.position.x,
                                top: item.position.y,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: [0, -16, 0],
                            }}
                            transition={{
                                opacity: { duration: 0.6, delay: 0.3 + index * 0.12 },
                                scale: { duration: 0.6, delay: 0.3 + index * 0.12 },
                                y: {
                                    duration: 3.5 + index * 0.4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                },
                            }}
                        >
                            <div
                                style={{
                                    width: "68px",
                                    height: "68px",
                                    borderRadius: "50%",
                                    background: "var(--surface)",
                                    backdropFilter: "blur(12px)",
                                    border: "1.5px solid var(--green-border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                        "0 0 28px rgba(34,197,94,0.2), var(--card-shadow)",
                                }}
                            >
                                {item.icon}
                            </div>
                            <span
                                style={{
                                    fontFamily: "Outfit, sans-serif",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    padding: "2px 8px",
                                    borderRadius: 99,
                                }}
                            >
                                {item.label}
                            </span>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center text-center max-w-4xl"
                        style={{ gap: "28px" }}
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.35 }}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "var(--green-bg)",
                                border: "1px solid var(--green-border)",
                                borderRadius: 99,
                                padding: "5px 16px",
                                fontFamily: "Outfit, sans-serif",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "#22c55e",
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    display: "inline-block",
                                    animation: "pulse 2s infinite",
                                }}
                            />
                            {logo} — #1 Job Portal
                        </motion.div>

                        {/* Title */}
                        <h1
                            style={{
                                fontFamily: "Outfit, sans-serif",
                                fontWeight: 800,
                                fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
                                lineHeight: 1.1,
                                color: "var(--text)",
                                letterSpacing: "-0.025em",
                            }}
                        >
                            {title}
                            <br />
                            <span
                                style={{
                                    background:
                                        "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #4ade80 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                {highlightedText}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontFamily: "Outfit, sans-serif",
                                fontWeight: 400,
                                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                                lineHeight: 1.7,
                                color: "var(--text-muted)",
                                maxWidth: "520px",
                            }}
                        >
                            {subtitle}
                        </p>

                        {/* CTA Button */}
                        {ctaButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={ctaButton.onClick}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "0.8rem 2rem",
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                    border: "none",
                                    fontFamily: "Outfit, sans-serif",
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 20px rgba(34,197,94,0.35)",
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                {ctaButton.label}
                            </motion.button>
                        )}

                        {/* Stat row */}
                        <div
                            style={{
                                display: "flex",
                                gap: 40,
                                flexWrap: "wrap",
                                justifyContent: "center",
                                marginTop: 8,
                            }}
                        >
                            {[
                                { num: "13k+", label: "Jobs Posted" },
                                { num: "8k+", label: "Companies" },
                                { num: "50k+", label: "Job Seekers" },
                            ].map((s) => (
                                <div key={s.label} style={{ textAlign: "center" }}>
                                    <p
                                        style={{
                                            fontWeight: 800,
                                            fontSize: "1.6rem",
                                            color: "var(--text)",
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {s.num}
                                    </p>
                                    <p
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "0.78rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Brand Ticker */}
            {brands.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="relative z-10 w-full overflow-hidden"
                    style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "32px",
                        paddingBottom: "32px",
                    }}
                >
                    <div className="text-center mb-6">
                        <span
                            style={{
                                fontFamily: "Outfit, sans-serif",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "var(--text-faint)",
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                            }}
                        >
                            {trustedByText}
                        </span>
                    </div>

                    {/* Edge fade overlays */}
                    <div
                        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
                        style={{
                            width: "140px",
                            background:
                                "linear-gradient(90deg, var(--hero-bg) 0%, transparent 100%)",
                        }}
                    />
                    <div
                        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
                        style={{
                            width: "140px",
                            background:
                                "linear-gradient(270deg, var(--hero-bg) 0%, transparent 100%)",
                        }}
                    />

                    <motion.div
                        className="flex items-center"
                        animate={{ x: [0, -(brands.length * 200)] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: brands.length * 4,
                                ease: "linear",
                            },
                        }}
                        style={{ gap: "72px", paddingLeft: "72px" }}
                    >
                        {[...brands, ...brands].map((brand, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 flex items-center justify-center transition-opacity"
                                style={{
                                    width: "110px",
                                    height: "36px",
                                    opacity: 0.45,
                                    filter: "var(--brand-filter)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.45)}
                            >
                                {brand.logo}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}

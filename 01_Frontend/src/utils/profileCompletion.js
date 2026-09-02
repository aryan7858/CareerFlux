/**
 * Single source of truth for calculating Profile Completion Percentage across CareerFlux
 * Used by Profile.jsx, SeekerDashboard.jsx, EmployerDashboard.jsx, and Onboarding Banners.
 */

export function getJobseekerProfileItems(user, resume = null) {
    const skillsList = Array.isArray(user?.skills) 
        ? user.skills 
        : (typeof user?.skills === 'string' ? user.skills.split(',').filter(Boolean) : []);

    return [
        { key: 'name', label: 'Full name', done: !!(user?.firstName || user?.name) },
        { key: 'headline', label: 'Headline / Bio', done: !!(user?.headline || user?.bio) },
        { key: 'contact', label: 'Location / Contact', done: !!(user?.location || user?.phone) },
        { key: 'skills', label: 'Skills listed', done: skillsList.length > 0 },
        { key: 'resume', label: 'Resume uploaded', done: !!(resume || user?.resumeUrl) },
    ];
}

export function getEmployerProfileItems(user) {
    return [
        { key: 'companyName', label: 'Company name', done: !!user?.companyName },
        { key: 'website', label: 'Company website', done: !!user?.companyWebsite },
        { key: 'industry', label: 'Industry', done: !!user?.industry },
        { key: 'size', label: 'Company size', done: !!(user?.companySize && user.companySize !== '') },
        { key: 'description', label: 'Company description', done: !!user?.companyDescription },
    ];
}

export function getProfileCompletion(user, resume = null) {
    if (!user) return 0;
    
    const isEmployer = user.role === 'employer';
    const items = isEmployer 
        ? getEmployerProfileItems(user) 
        : getJobseekerProfileItems(user, resume);

    const completedCount = items.filter(i => i.done).length;
    return Math.round((completedCount / items.length) * 100);
}

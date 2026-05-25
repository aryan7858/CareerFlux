const axios = require('axios');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Robust local matching algorithm between user and job profile
 */
const calculateLocalMatch = (user, job) => {
  const userSkills = (user.skills || []).map(s => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim());
  
  const matchedSkills = [];
  const missingSkills = [];
  
  jobSkills.forEach(skill => {
    if (userSkills.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate skill overlap percentage
  let skillScore = 0;
  if (jobSkills.length > 0) {
    skillScore = (matchedSkills.length / jobSkills.length) * 100;
  } else {
    // If job does not define key skills, search inside description for seeker's skills
    const descriptionText = `${job.title} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
    let overlapCount = 0;
    userSkills.forEach(skill => {
      if (descriptionText.includes(skill)) {
        overlapCount++;
        matchedSkills.push(skill);
      }
    });
    skillScore = userSkills.length > 0 ? Math.min(100, (overlapCount / Math.min(5, userSkills.length)) * 100) : 60;
  }

  // Calculate experience fit
  let expScore = 100;
  const userExpYears = user.experience?.length || 0;
  const expRequirements = { entry: 0, mid: 2, senior: 5, lead: 8, executive: 10 };
  const targetYears = expRequirements[job.experienceLevel] || 2;
  if (userExpYears < targetYears) {
    expScore = Math.max(30, 100 - (targetYears - userExpYears) * 15);
  }

  const overallScore = Math.round((skillScore * 0.7) + (expScore * 0.3));

  let recommendation = 'Reviewed / Keep in View';
  if (overallScore >= 75) recommendation = 'Shortlist';
  else if (overallScore >= 50) recommendation = 'Interview';
  else recommendation = 'Reject';

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const matchedCap = matchedSkills.map(cap);
  const missingCap = missingSkills.map(cap);

  return {
    score: overallScore,
    matchedSkills: matchedCap,
    missingSkills: missingCap,
    recommendation,
    strengths: matchedCap.length > 0 
      ? `Demonstrates proficiency in key required skills: ${matchedCap.join(', ')}.` 
      : 'Has active jobseeker profile with solid academic or professional experience.',
    gaps: missingCap.length > 0 
      ? `Could improve compatibility by gaining experience in: ${missingCap.join(', ')}.` 
      : 'No significant skill gaps identified for this role.',
    reason: `Candidate has a matching score of ${overallScore}%. They possess ${matchedCap.length} matching skills and have an experience alignment rating of ${Math.round(expScore)}%.`,
  };
};

/**
 * Call Gemini API directly using axios for LLM resume screening & compatibility check
 */
const callGeminiAI = async (user, job) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;

    const prompt = `
You are an expert AI recruiter for CareerFlux.
Analyze the alignment between the Candidate Profile and the Job Posting.
Return your evaluation STRICTLY as a JSON object matching this schema. Do not enclose it in any markdown blocks or append any other text. It must be clean parseable JSON:
{
  "score": integer (0 to 100),
  "matchedSkills": [string],
  "missingSkills": [string],
  "recommendation": string ("Shortlist", "Interview", "Reject", "Reviewed / Keep in View"),
  "strengths": string (1-2 sentences summarizing candidate strengths relative to this job),
  "gaps": string (1-2 sentences summarizing gaps/missing skills),
  "reason": string (a short 2-3 sentence overview explaining your recommendation)
}

Job Posting:
Title: ${job.title}
Description: ${job.description}
Requirements: ${JSON.stringify(job.requirements || [])}
Skills: ${JSON.stringify(job.skills || [])}
Experience Level: ${job.experienceLevel}

Candidate Profile:
Name: ${user.firstName} ${user.lastName || ''}
Headline: ${user.headline || 'N/A'}
Bio: ${user.bio || 'N/A'}
Skills: ${JSON.stringify(user.skills || [])}
Experience: ${JSON.stringify((user.experience || []).map(e => ({ title: e.title, company: e.company, description: e.description })))}
Education: ${JSON.stringify((user.education || []).map(ed => ({ degree: ed.degree, institution: ed.institution, field: ed.field })))}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    console.error('Gemini API call failed, falling back to local matcher:', err.message);
  }
  return null;
};

/**
 * @desc    Get recommended jobs for logged-in seeker
 * @route   GET /api/ai/recommendations
 * @access  Private (Jobseeker)
 */
exports.getSmartRecommendations = async (req, res) => {
  try {
    const seeker = req.user;
    const activeJobs = await Job.find({ isActive: true }).populate('postedBy', 'companyName companyLogoUrl');
    
    const recommendations = activeJobs.map(job => {
      const match = calculateLocalMatch(seeker, job);
      return {
        job,
        matchScore: match.score,
        matchDetails: {
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reason: match.reason
        }
      };
    });

    // Sort by matching score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 10 recommended jobs
    return sendSuccess(res, { recommendations: recommendations.slice(0, 10) }, 'AI smart recommendations loaded.');
  } catch (err) {
    console.error('getSmartRecommendations error:', err);
    return sendError(res, 'Failed to fetch recommendations.', 500);
  }
};

/**
 * @desc    Rank and screen applicants for an employer's job listing
 * @route   GET /api/ai/screen-applicants/:jobId
 * @access  Private (Employer)
 */
exports.screenApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 'Job listing not found.', 404);
    }

    // Verify ownership
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to screen applicants for this job.', 403);
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'firstName lastName email headline skills experience education location');

    const screenedList = await Promise.all(
      applications.map(async (app) => {
        const applicant = app.applicant;
        if (!applicant) return null;

        let matchResult = null;
        if (process.env.GEMINI_API_KEY) {
          matchResult = await callGeminiAI(applicant, job);
        }

        if (!matchResult) {
          matchResult = calculateLocalMatch(applicant, job);
        }

        return {
          applicationId: app._id,
          applicantName: `${applicant.firstName} ${applicant.lastName || ''}`.trim(),
          matchScore: matchResult.score,
          recommendation: matchResult.recommendation,
          report: matchResult,
        };
      })
    );

    const filtered = screenedList.filter(Boolean);
    // Sort by compatibility score
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    return sendSuccess(res, { screened: filtered }, 'AI applicant screening completed.');
  } catch (err) {
    console.error('screenApplicants error:', err);
    return sendError(res, 'Failed to perform AI candidate screening.', 500);
  }
};

/**
 * @desc    Retrieve detailed matching report for a single application
 * @route   GET /api/ai/match-details/:applicationId
 * @access  Private (Jobseeker or Employer)
 */
exports.getMatchDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const app = await Application.findById(applicationId)
      .populate('job')
      .populate('applicant', 'firstName lastName email headline skills experience education location');

    if (!app) {
      return sendError(res, 'Application not found.', 404);
    }

    // Check authorization (seeker, employer assignee, job poster, admin)
    const isSeeker = app.applicant._id.toString() === req.user._id.toString();
    const isOwner = app.job.postedBy.toString() === req.user._id.toString();
    const isAssignee = app.assignedTo && app.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSeeker && !isOwner && !isAssignee && !isAdmin) {
      return sendError(res, 'Not authorized to view matching report.', 403);
    }

    let matchResult = null;
    if (process.env.GEMINI_API_KEY) {
      matchResult = await callGeminiAI(app.applicant, app.job);
    }

    if (!matchResult) {
      matchResult = calculateLocalMatch(app.applicant, app.job);
    }

    return sendSuccess(res, { matchReport: matchResult }, 'AI match details loaded.');
  } catch (err) {
    console.error('getMatchDetails error:', err);
    return sendError(res, 'Failed to fetch AI match report details.', 500);
  }
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },

    // ── Role ──────────────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker',
    },

    // ── Profile (Job Seeker) ──────────────────────────────────────────────────
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1000 },
    location: { type: String, trim: true },
    phone: { type: String, trim: true },
    resumeUrl: { type: String },
    skills: [{ type: String, trim: true }],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        field: String,
        startYear: Number,
        endYear: Number,
      },
    ],

    // ── Profile (Employer) ────────────────────────────────────────────────────
    companyName: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''],
      default: '',
    },
    industry: { type: String, trim: true },
    companyLogoUrl: { type: String },
    companyDescription: { type: String, trim: true, maxlength: 2000 },

    // ── Auth & Security ───────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // ── Social Links ──────────────────────────────────────────────────────────
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },

    // ── Portfolio Uploads, Endorsements, and Verification ─────────────────────
    portfolioProjects: [
      {
        title: { type: String, required: true },
        description: { type: String, trim: true },
        projectUrl: { type: String, trim: true },
        fileUrl: { type: String },
        fileName: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    endorsements: [
      {
        skill: { type: String, required: true, trim: true },
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
      }
    ],
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    verificationDocUrl: { type: String }
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe public profile ─────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'skills': 1 });

module.exports = mongoose.model('User', userSchema);

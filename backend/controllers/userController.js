const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { Op } = require('sequelize');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch user basic info
        const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email', 'role', 'wallet_address'] });
        
        // Fetch profile
        const profile = await Profile.findOne({ where: { user_id: userId } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user,
            profile: profile || null
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            // User core info
            fullName,
            // Freelancer fields
            domain, location, languages, bio, experienceLevel, hourlyRate, skills, experience, portfolio, walletAddress,
            // Client fields
            companyName, companyDescription, industry, budgetRange, hiringPreference, website
        } = req.body;

        // 1. Update core user details
        const userUpdates = {};
        if (walletAddress !== undefined) userUpdates.wallet_address = walletAddress;
        if (fullName !== undefined) userUpdates.name = fullName;

        if (Object.keys(userUpdates).length > 0) {
            await User.update(userUpdates, { where: { id: userId } });
        }

        // 2. Find or create profile record
        let profile = await Profile.findOne({ where: { user_id: userId } });
        
        const profileData = {
            user_id: userId,
            domain,
            location,
            languages,
            bio,
            experience_level: experienceLevel,
            hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
            skills, 
            experience, 
            portfolio,
            company_name: companyName,
            company_description: companyDescription,
            industry,
            budget_range: budgetRange,
            hiring_preference: hiringPreference,
            website
        };

        // If an image was uploaded, store the path
        if (req.file) {
            profileData.profile_image = `/uploads/${req.file.filename}`;
        }

        if (profile) {
            // Update existing profile
            profile = await profile.update(profileData);
        } else {
            // Create new profile
            profile = await Profile.create(profileData);
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            profile
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        let stats = {};

        if (role === 'client') {
            // Client Stats
            const totalPosted = await Job.count({ where: { client_id: userId } });
            
            const activeHires = await Job.count({
                where: { client_id: userId, status: 'in_progress' }
            });

            // Calculate exact total spend (completed jobs)
            const completedJobs = await Job.findAll({
                where: { client_id: userId, status: 'completed' },
                attributes: ['budget']
            });
            const totalSpend = completedJobs.reduce((sum, job) => sum + parseFloat(job.budget), 0);
            
            stats = {
                metricOne: { label: 'Total Spend', value: totalSpend, isCurrency: true },
                metricTwo: { label: 'Active Hires', value: activeHires, isCurrency: false },
                metricThree: { label: 'Total Gig Postings', value: totalPosted, isCurrency: false }
            };

        } else if (role === 'freelancer') {
            // Freelancer Stats
            const totalPitches = await Application.count({ where: { freelancer_id: userId } });
            
            const activeGigs = await Application.count({
                where: { freelancer_id: userId, status: 'accepted' },
                include: [{ model: Job, as: 'job', where: { status: 'in_progress' } }]
            });

            // Calculate precise earnings (accepted applications where the core job is completed)
            const completedApps = await Application.findAll({
                where: { freelancer_id: userId, status: 'accepted' },
                include: [{
                    model: Job,
                    as: 'job',
                    where: { status: 'completed' },
                    attributes: ['budget']
                }]
            });
            const totalEarned = completedApps.reduce((sum, app) => sum + parseFloat(app.job.budget), 0);

            stats = {
                metricOne: { label: 'Total Earned', value: totalEarned, isCurrency: true },
                metricTwo: { label: 'Active Gigs', value: activeGigs, isCurrency: false },
                metricThree: { label: 'Total Pitches Sent', value: totalPitches, isCurrency: false }
            };
        } else {
             return res.status(403).json({ message: 'Unknown role' });
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error calculating dashboard stats:', error);
        res.status(500).json({ message: 'Failed to generate metrics' });
    }
};

// Fetch public profile by ID
const getPublicProfile = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        const user = await User.findByPk(targetUserId, { 
            attributes: ['id', 'name', 'email', 'role', 'wallet_address', 'created_at'] 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ where: { user_id: targetUserId } });

        res.status(200).json({
            user,
            profile: profile || null
        });
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ message: 'Server error fetching public profile' });
    }
};

module.exports = { getProfile, updateProfile, getDashboardStats, getPublicProfile };

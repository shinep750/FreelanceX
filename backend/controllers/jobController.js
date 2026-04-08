const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Dispute = require('../models/Dispute');
const Message = require('../models/Message');
const Transaction = require('../models/Transaction');

const getJobs = async (req, res) => {
    try {
        // Fetch all open jobs
        const jobs = await Job.findAll({
            where: { status: 'open' },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'name']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        let userApplications = [];
        
        // If a user is logged in, find all their applications to know which they've already applied to
        if (req.user) {
            userApplications = await Application.findAll({
                where: { freelancer_id: req.user.id },
                attributes: ['job_id']
            });
        }
        
        const appliedJobIds = userApplications.map(app => app.job_id);

        const formattedJobs = jobs.map(job => {
            const jobData = job.toJSON();
            // Flag to indicate if the current user has already applied
            jobData.hasApplied = appliedJobIds.includes(job.id);
            return jobData;
        });

        res.status(200).json(formattedJobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Failed to fetch jobs' });
    }
};

const createJob = async (req, res) => {
    try {
        if (req.user.role !== 'client' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only clients can post jobs' });
        }

        const { title, description, budget, deadline } = req.body;

        if (!title || !description || !budget) {
            return res.status(400).json({ message: 'Please provide all required fields (title, description, budget)' });
        }

        const job = await Job.create({
            title,
            description,
            budget: parseFloat(budget),
            deadline: deadline || null,
            client_id: req.user.id,
            status: 'open'
        });

        res.status(201).json({ message: 'Job posted successfully!', job });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Server error creating job' });
    }
};

const getClientJobs = async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const jobs = await Job.findAll({
            where: { client_id: req.user.id },
            include: [
                {
                    model: Application,
                    as: 'applications',
                    include: [
                        { model: User, as: 'freelancer', attributes: ['id', 'name', 'email', 'wallet_address'] }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching client jobs:', error);
        res.status(500).json({ message: 'Failed to fetch your jobs' });
    }
};

const applyJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const freelancerId = req.user.id;

        // Check if job exists
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Prevent clients or admins from applying
        if (req.user.role === 'client') {
            return res.status(403).json({ message: 'Clients cannot apply to jobs' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({
            where: {
                job_id: jobId,
                freelancer_id: freelancerId
            }
        });

        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Create application
        const application = await Application.create({
            job_id: jobId,
            freelancer_id: freelancerId,
            status: 'pending' // Default status per requirements
        });

        res.status(201).json({ 
            message: 'Successfully applied to job',
            application 
        });

    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ message: 'Failed to apply to job' });
    }
};
const acceptApplication = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const clientId = req.user.id;

        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can accept applications' });
        }

        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.client_id !== clientId) {
            return res.status(403).json({ message: 'Not authorized to manage this job' });
        }

        if (job.status !== 'open') {
             return res.status(400).json({ message: 'Job is no longer open' });
        }

        const application = await Application.findByPk(applicationId);
        if (!application || application.job_id.toString() !== jobId) {
            return res.status(404).json({ message: 'Application not found for this job' });
        }

        // Update Job Status
        job.status = 'in_progress';
        await job.save();

        // Update Application Status
        application.status = 'accepted';
        await application.save();

        // Log Transaction (Funded via Frontend MetaMask)
        await Transaction.create({
            job_id: job.id,
            actor_id: req.user.id,
            type: 'funded',
            amount: job.budget,
            transaction_hash: null // Placeholder until frontend starts sending it
        });

        res.status(200).json({ message: 'Pitch accepted. Job is now In Progress.', job, application });
    } catch (error) {
        console.error('Error accepting application:', error);
        res.status(500).json({ message: 'Server error accepting application' });
    }
};

const getFreelancerJobs = async (req, res) => {
    try {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const applications = await Application.findAll({
            where: { freelancer_id: req.user.id },
            include: [
                {
                    model: Job,
                    as: 'job',
                    include: [
                        { model: User, as: 'client', attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching freelancer jobs:', error);
        res.status(500).json({ message: 'Failed to fetch your jobs' });
    }
};

const completeJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const clientId = req.user.id;

        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can mark jobs as completed' });
        }

        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.client_id !== clientId) {
            return res.status(403).json({ message: 'Not authorized to manage this job' });
        }

        if (job.status !== 'in_progress') {
             return res.status(400).json({ message: 'Job is not in progress' });
        }

        // Update Job Status
        job.status = 'completed';
        await job.save();

        // Log Transaction (Released via Frontend MetaMask)
        await Transaction.create({
            job_id: job.id,
            actor_id: req.user.id,
            type: 'released',
            amount: job.budget,
            transaction_hash: null // Placeholder for client interaction
        });

        res.status(200).json({ message: 'Job successfully marked as Completed!', job });
    } catch (error) {
        console.error('Error completing job:', error);
        res.status(500).json({ message: 'Server error completing job' });
    }
};

const raiseDispute = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;
        
        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: 'Dispute reason/evidence is required' });
        }

        const job = await Job.findByPk(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (req.user.role === 'client' && job.client_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to dispute this job' });
        }
        
        if (req.user.role === 'freelancer') {
            const application = await Application.findOne({ where: { job_id: jobId, freelancer_id: userId, status: 'accepted' } });
            if (!application) return res.status(403).json({ message: 'Not authorized to dispute this job' });
        }

        if (job.status !== 'in_progress') {
             return res.status(400).json({ message: 'Only in-progress jobs can be disputed' });
        }

        // Create the Dispute record
        await Dispute.create({
            job_id: job.id,
            initiator_id: userId,
            reason: reason,
            status: 'open'
        });

        job.status = 'disputed';
        await job.save();

        res.status(200).json({ message: 'Dispute raised successfully', job });
    } catch (error) {
        console.error('Error raising dispute:', error);
        res.status(500).json({ message: 'Server error raising dispute' });
    }
};

const { ethers } = require('ethers');

const resolveDispute = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { releaseToFreelancer, adminNotes } = req.body;
        
        if (adminNotes === undefined || adminNotes.trim() === '') {
            return res.status(400).json({ message: 'Admin notes are required for resolving disputes' });
        }

        const job = await Job.findByPk(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.status !== 'disputed') {
             return res.status(400).json({ message: 'Job is not disputed' });
        }

        // --- WEB3 RELAYER LOGIC ---
        // Backend takes over signing the transaction with the Admin/Deployer Private Key
        try {
            const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
            // Default hardhat deployer key (Account 0) used for testnet
            const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
            const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
            
            const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
            const ESCROW_ABI = [
                "function resolveDispute(uint256 _projectId, bool _releaseToFreelancer) external"
            ];
            const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, adminWallet);

            // Execute the Smart Contract Function (replaces frontend MetaMask popup)
            const tx = await escrowContract.resolveDispute(job.id, releaseToFreelancer);
            await tx.wait(); // Wait for blockchain confirmation
            console.log(`✅ Blockchain: Dispute legally resolved for Job ${job.id}`);
            
            // Log Transaction (Relayed via Backend)
            await Transaction.create({
                job_id: job.id,
                actor_id: req.user.id, // Admin who clicked resolve
                type: releaseToFreelancer ? 'released' : 'refunded',
                amount: job.budget,
                transaction_hash: tx.hash
            });
        } catch (web3Error) {
            console.error('Blockchain execution reverted during Backend Relay:', web3Error);
            return res.status(500).json({ message: 'Smart Contract execution failed: ' + (web3Error.reason || web3Error.message) });
        }
        // --- END WEB3 LOGIC ---

        // Update the Dispute Record in Database
        const dispute = await Dispute.findOne({ where: { job_id: jobId, status: 'open' } });
        if (dispute) {
            dispute.admin_notes = adminNotes;
            dispute.status = 'resolved';
            await dispute.save();
        }

        job.status = releaseToFreelancer ? 'completed' : 'refunded';
        await job.save();

        res.status(200).json({ message: 'Dispute resolved successfully on both Database and Blockchain', job });
    } catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ message: 'Server error resolving dispute' });
    }
};

const deliverWork = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { note } = req.body;
        const freelancerId = req.user.id;
        
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ message: 'Only freelancers can deliver work' });
        }
        
        const job = await Job.findByPk(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.status !== 'in_progress') {
             return res.status(400).json({ message: 'Job must be in progress to deliver work' });
        }
        
        const application = await Application.findOne({ where: { job_id: jobId, freelancer_id: freelancerId, status: 'accepted' } });
        if (!application) {
            return res.status(403).json({ message: 'Not authorized to deliver work for this job' });
        }
        
        application.delivery_note = note || 'No note provided.';
        application.delivered_at = new Date();
        await application.save();

        // Inform Client via automated Chat Message
        await Message.create({
            job_id: jobId,
            sender_id: freelancerId,
            receiver_id: job.client_id,
            content: `🚀 **AUTOMATED NOTIFICATION: Work Delivered!**\n\nThe freelancer has formally submitted the final deliverables for review.\n\n**Delivery Link/Notes:**\n${note || 'No note provided.'}`,
            is_read: false
        });
        
        res.status(200).json({ message: 'Work delivered successfully. Client notified.', application });
    } catch (error) {
        console.error('Error delivering work:', error);
        res.status(500).json({ message: 'Server error delivering work' });
    }
};

const getDisputedJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { status: 'disputed' },
            include: [
                { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
                {
                    model: Application,
                    as: 'applications',
                    where: { status: 'accepted' },
                    required: false,
                    include: [{ model: User, as: 'freelancer', attributes: ['id', 'name', 'email', 'wallet_address'] }]
                },
                {
                    model: Dispute,
                    as: 'dispute',
                    include: [{ model: User, as: 'initiator', attributes: ['id', 'name', 'email'] }]
                }
            ],
            order: [['updated_at', 'DESC']]
        });
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching disputed jobs:', error);
        res.status(500).json({ message: 'Failed to fetch disputed jobs' });
    }
};

module.exports = {
    getJobs,
    applyJob,
    createJob,
    getClientJobs,
    acceptApplication,
    getFreelancerJobs,
    completeJob,
    raiseDispute,
    resolveDispute,
    getDisputedJobs,
    deliverWork
};

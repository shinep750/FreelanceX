const express = require('express');
const { getJobs, applyJob, createJob, getClientJobs, acceptApplication, getFreelancerJobs, completeJob, raiseDispute, resolveDispute, getDisputedJobs, deliverWork } = require('../controllers/jobController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all jobs (For Freelancers)
router.get('/', protect, getJobs);

// POST create a job (For Clients)
router.post('/', protect, createJob);

// GET client's own jobs (For Clients)
router.get('/client', protect, getClientJobs);

// GET freelancer's applied/active jobs (For Freelancers)
router.get('/freelancer', protect, getFreelancerJobs);

// POST apply to a job (For Freelancers)
router.post('/apply', protect, applyJob);

// POST accept an application (For Clients)
router.post('/:jobId/accept/:applicationId', protect, acceptApplication);

// POST mark a job as completed (For Clients)
router.post('/:jobId/complete', protect, completeJob);

// POST raise a dispute (For Clients/Freelancers)
router.post('/:jobId/dispute', protect, raiseDispute);

// GET disputed jobs (For Admin)
router.get('/disputed', protect, isAdmin, getDisputedJobs);

// POST resolve a dispute (For Admin)
router.post('/:jobId/resolve', protect, isAdmin, resolveDispute);

// POST deliver work (For Freelancers)
router.post('/:jobId/deliver', protect, deliverWork);

module.exports = router;

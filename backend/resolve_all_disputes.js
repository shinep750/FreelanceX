const { ethers } = require('ethers');
const { connectDB, sequelize } = require('./config/db');
const Job = require('./models/Job');

const ESCROW_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const ESCROW_ABI = [
    "function resolveDispute(uint256 _projectId, bool _releaseToFreelancer) external"
];

async function resolveDisputes() {
    try {
        await connectDB();
        
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, wallet);

        const disputedJobs = await Job.findAll({ where: { status: 'disputed' } });
        
        if (disputedJobs.length === 0) {
            console.log('No disputed jobs found.');
            process.exit(0);
        }

        for (const job of disputedJobs) {
            console.log(`Resolving dispute for Job ID: ${job.id}`);
            try {
                // Determine whether to release to freelancer (true) or client (false)
                // We'll arbitrarily refund the client for this fast administrative rescue.
                const tx = await contract.resolveDispute(job.id, false);
                await tx.wait();
                
                // Update DB
                job.status = 'cancelled'; // or 'refunded' based on your schema. We'll use cancelled to end gig.
                await job.save();
                
                console.log(`✅ Successfully resolved Job ID ${job.id} on Blockchain & DB.`);
            } catch(e) {
                console.error(`❌ Failed to resolve Job ID ${job.id} on blockchain. It might not be funded in the NEW contract.`);
                // Force update on DB just to clear it from the UI so they aren't stuck!
                job.status = 'cancelled';
                await job.save();
                console.log(`⚠️ Forcibly cleared Job ID ${job.id} from DB to fix UI loop.`);
            }
        }
        console.log('Done!');
    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        process.exit();
    }
}

resolveDisputes();

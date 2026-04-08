const Transaction = require('../models/Transaction');
const Job = require('../models/Job');
const User = require('../models/User');

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: Job,
                    as: 'job',
                    attributes: ['title', 'budget', 'status']
                },
                {
                    model: User,
                    as: 'actor',
                    attributes: ['name', 'email', 'role']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error fetching transactions ledger' });
    }
};

module.exports = {
    getAllTransactions
};

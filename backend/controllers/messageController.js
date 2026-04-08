const Message = require('../models/Message');
const Job = require('../models/Job');
const User = require('../models/User');
const { Op } = require('sequelize');

const getJobMessages = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id; // Logged in user parsing the request

        // Validate Job exists
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Technically, a freelancer applicant should only be able to view their own chats,
        // and the client should only view chats with the accepted freelancer.
        // For MVP, we will just fetch all messages for this Job where the user is either sender or receiver.
        const messages = await Message.findAll({
            where: {
                job_id: jobId,
                [Op.or]: [
                    { sender_id: userId },
                    { receiver_id: userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'receiver', attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'ASC']] // Oldest to newest
        });

        // Optionally mark these messages as read when fetched if receiver is current user
        await Message.update(
            { is_read: true },
            {
                where: {
                    job_id: jobId,
                    receiver_id: userId,
                    is_read: false
                }
            }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching job messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { jobId, receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!jobId || !receiverId || !content) {
             return res.status(400).json({ message: 'Missing required payload parameters' });
        }

        const job = await Job.findByPk(jobId);
        if (!job) {
             return res.status(404).json({ message: 'Job not found' });
        }

        // Create the message directly
        const newMessage = await Message.create({
            job_id: jobId,
            sender_id: senderId,
            receiver_id: receiverId,
            content: content
        });

        // Fetch back with eager loaded user details to send to frontend immediately
        const populatedMessage = await Message.findByPk(newMessage.id, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'receiver', attributes: ['id', 'name'] }
            ]
        });

        res.status(201).json({ message: 'Message sent successfully', chat: populatedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

module.exports = {
    getJobMessages,
    sendMessage
};

const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');

const makeAdmin = async () => {
    try {
        await connectDB();
        const user = await User.findOne();
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`Updated user ${user.email} to Admin.`);
        } else {
            console.log('No users found in database to make an admin.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
};

makeAdmin();

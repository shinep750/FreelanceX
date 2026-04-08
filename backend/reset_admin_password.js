const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');

const resetPassword = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ where: { role: 'admin' } });
        if (user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('password123', salt);
            await user.save();
            console.log(`\n=========================================\n✅ SUCCESS: Password for ${user.email} has been reset!\nNew Password: password123\n=========================================\n`);
        } else {
            console.log('No admin found. Please create an account first.');
        }
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

resetPassword();

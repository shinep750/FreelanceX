const ethers = require('ethers');
const User = require('./models/User');

require('./config/db').connectDB().then(async () => {
    const users = await User.findAll();
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
    let nonce = await wallet.getNonce();
    
    for (let u of users) {
        if (u.wallet_address && u.wallet_address.length === 42) {
            console.log('Funding', u.wallet_address);
            try {
                await wallet.sendTransaction({
                    to: u.wallet_address, 
                    value: ethers.parseEther('10'),
                    nonce: nonce++
                });
                console.log('Success for', u.wallet_address);
            } catch (e) {
                console.log('Error for', u.wallet_address, e.message);
            }
        }
    }
    console.log('Done funding!');
    process.exit(0);
});

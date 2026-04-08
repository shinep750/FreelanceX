/**
 * Parses raw error objects from Ethers.js or Fetch APIs 
 * into concise, user-friendly toast messages.
 */
export const parseEthersError = (err) => {
    // If it's just a string, return it
    if (typeof err === 'string') return err;

    // Extract the raw error message string from the Error object
    // Ethers errors often nest the message in `.info.error.message` or just `.message`
    const message = err?.info?.error?.message || err?.message || err?.toString() || "An unknown error occurred.";

    // Convert to lowercase for easier keyword matching
    const lowerMsg = message.toLowerCase();

    // 1. Web3 Connection Errors (The ones causing the massive toast blocks)
    if (lowerMsg.includes("rpc endpoint returned too many errors") || lowerMsg.includes("could not coalesce error")) {
        return "Cannot connect to local blockchain. Please start the Hardhat node.";
    }
    if (lowerMsg.includes("network string is required") || lowerMsg.includes("missing provider")) {
        return "MetaMask is not connected to any network.";
    }

    // 2. User Rejection
    if (lowerMsg.includes("user rejected") || lowerMsg.includes("user denied")) {
        return "Transaction was cancelled in your wallet.";
    }
    
    // 3. Smart Contract Reverts
    if (lowerMsg.includes("execution reverted")) {
        // Try parsing Custom Errors off the ABI if they exist in the message
        if (lowerMsg.includes("invalid state")) return "Transaction failed: Invalid contract state.";
        if (lowerMsg.includes("not authorized")) return "Transaction failed: You are not authorized.";
        return "Smart contract rejected the transaction. Please check your data.";
    }

    // 4. Gas / Balance Issues
    if (lowerMsg.includes("insufficient funds") || lowerMsg.includes("exceeds balance")) {
        return "You do not have enough ETH to pay for this transaction.";
    }
    if (lowerMsg.includes("intrinsic gas too low") || lowerMsg.includes("out of gas")) {
        return "Transaction ran out of gas. Increase gas limit and try again.";
    }

    // 5. Backend HTTP Errors (Since our catch blocks throw new Error(data.message))
    // We don't want to swallow specific backend messages.
    // Usually these are pure strings like "Failed to accept pitch" without Web3 jargo.
    
    // Fallback: If it's relatively short, just return the message natively
    if (message.length < 80) return message; 
    
    // Fallback for weird massive Ethers objects
    return "A system error occurred. Check the developer console for details.";
};

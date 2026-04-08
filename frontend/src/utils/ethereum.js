import { BrowserProvider, Contract } from 'ethers';
import EscrowArtifact from '../contracts/Escrow.json';

// Extracted from Hardhat Ignition deployed_addresses.json (Localhost 1337)
export const ESCROW_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install MetaMask to use FreelanceX.");
    }
    return new BrowserProvider(window.ethereum);
};

export const switchToLocalNetwork = async () => {
    if (!window.ethereum) return;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337 in hex
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0x539',
                            chainName: 'Hardhat Localhost',
                            rpcUrls: ['http://127.0.0.1:8545'],
                            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                        },
                    ],
                });
            } catch (addError) {
                console.error("Failed to add local network", addError);
            }
        }
    }
};

export const getEscrowContract = async (provider) => {
    const signer = await provider.getSigner();
    return new Contract(ESCROW_ADDRESS, EscrowArtifact.abi, signer);
};

import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const code = await provider.getCode(address);
    console.log("Code length at address:", code.length);
    if (code === "0x") {
        console.log("NO CONTRACT DEPLOYED AT THIS ADDRESS!");
    } else {
        console.log("Contract is deployed successfully!");
    }
}
main();

const hre = require("hardhat");

async function main() {
  const Escrow = await hre.ethers.getContractAt("Escrow", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const [signer] = await hre.ethers.getSigners();
  
  console.log("Testing fundMilestone...");
  try {
    const tx = await Escrow.fundMilestone(6, "0xbb45405caed3bc15f52de32b9e25597cd0620538", { value: hre.ethers.parseEther("0.004") });
    await tx.wait();
    console.log("Success!");
  } catch (error) {
    console.error("Reverted with:", error.message);
  }
}

main().catch(console.error);

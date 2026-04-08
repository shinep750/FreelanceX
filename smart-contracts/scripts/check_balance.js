import hre from "hardhat";

async function main() {
  const accountToCheck = "0x4aefbc418954cb006d9815a0640d373d7f0f60c5";
  const balance = await hre.ethers.provider.getBalance(accountToCheck);
  console.log(`Current Balance of ${accountToCheck}: ${hre.ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);

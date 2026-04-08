import hre from "hardhat";

async function main() {
  const accountToFund = "0x4aefbc418954cb006d9815a0640d373d7f0f60c5";
  
  // Get the first Hardhat account (the one with 10000 ETH)
  const [sender] = await hre.ethers.getSigners();
  
  console.log(`Funding account ${accountToFund} from ${sender.address}`);
  
  const tx = await sender.sendTransaction({
    to: accountToFund,
    value: hre.ethers.parseEther("1000.0") // Sending 1000 ETH
  });
  
  await tx.wait();
  
  console.log(`Successfully funded ${accountToFund} with 1000 ETH`);
  
  const newBalance = await hre.ethers.provider.getBalance(accountToFund);
  console.log(`New balance: ${hre.ethers.formatEther(newBalance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

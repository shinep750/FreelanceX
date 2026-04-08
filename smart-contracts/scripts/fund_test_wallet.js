const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

  const tx = await wallet.sendTransaction({
      to: "0x4aeFbC418954CB006d9815A0640d373D7f0F60c5",
      value: ethers.parseEther("100.0")
  });
  await tx.wait();
  console.log("Sent 100 ETH");
}

main().catch(console.error);

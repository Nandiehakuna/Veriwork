import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

// USDC addresses by network
const USDC_ADDRESSES: Record<string, string> = {
  fuji: "0x5425890298aed601595a70AB815c96711a31Bc65",
  avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6",
  hardhat: "0x5425890298aed601595a70AB815c96711a31Bc65", // Use fuji for testing
};

async function main() {
  const { ethers, network, run } = hre;

  const networkName = network.name;
  const usdcAddress = USDC_ADDRESSES[networkName];

  if (!usdcAddress) {
    throw new Error(`USDC address not configured for network: ${networkName}`);
  }

  console.log(`Deploying VeriWork contract on ${networkName}...`);
  console.log(`Using USDC address: ${usdcAddress}`);

  const VeriWork = await ethers.getContractFactory("VeriWork");
  const veriWork = await VeriWork.deploy(usdcAddress);

  await veriWork.waitForDeployment();

  const address = await veriWork.getAddress();
  console.log(`VeriWork deployed to: ${address}`);

  // Save deployment address to deployments.json
  const deploymentsPath = path.join(process.cwd(), "deployments.json");
  const deployments: Record<string, string> = fs.existsSync(deploymentsPath)
    ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
    : {};

  deployments[networkName] = address;
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`Deployment saved to deployments.json`);

  // Verify contract on Snowtrace if on live network
  if (network.name === "avalanche" || network.name === "fuji") {
    console.log("Waiting for block confirmations...");
    await veriWork.deploymentTransaction()?.wait(5);

    console.log("Verifying contract on Snowtrace...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [usdcAddress],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
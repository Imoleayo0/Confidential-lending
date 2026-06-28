import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedVault = await deploy("CollateralVault", {
    from: deployer,
    log: true,
  });

  console.log(`CollateralVault contract: `, deployedVault.address);
};

export default func;
func.id = "deploy_collateralVault";
func.tags = ["CollateralVault"];

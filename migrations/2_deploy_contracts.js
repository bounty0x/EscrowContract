const SimpleToken = artifacts.require("SimpleToken");
const Bounty0xEscrow = artifacts.require("Bounty0xEscrow");

module.exports = async function(deployer) {
    deployer.then(async () => {
        await deployer.deploy(SimpleToken);
        let tokenContract = await SimpleToken.deployed();

        await deployer.deploy(Bounty0xEscrow, tokenContract.address);
    });
};

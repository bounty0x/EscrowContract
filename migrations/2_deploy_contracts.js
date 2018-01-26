const SimpleToken = artifacts.require("SimpleToken");
const Bounty0xEscrow = artifacts.require("Bounty0xEscrow");

module.exports = async function(deployer) {
    deployer.then(async () => {
        await deployer.deploy(SimpleToken);
        await deployer.deploy(Bounty0xEscrow);
    });
};

var SimpleToken = artifacts.require("SimpleToken");
var Bounty0xEscrow = artifacts.require("Bounty0xEscrow");

module.exports = function(deployer) {

    var tokenContract, bountyContract;

    deployer.deploy(SimpleToken).then(function() {
        return SimpleToken.deployed();
    }).then(function(instance) {
        tokenContract = instance;
        return deployer.deploy(Bounty0xEscrow, tokenContract.address);
    }).then(function() {
        return Bounty0xEscrow.deployed();
    }).then(function(instance) {
        bountyContract = instance;

        bountyContract.addSupportedToken(tokenContract.address);
        tokenContract.approve(bountyContract.address, 10000);
        bountyContract.depositToken(tokenContract.address, 10000);
    });
};

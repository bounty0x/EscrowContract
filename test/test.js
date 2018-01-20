var Bounty0xEscrow = artifacts.require("Bounty0xEscrow");
var SimpleToken = artifacts.require("SimpleToken");


contract('Bounty0xEscrow', function(accounts) {

    it("Bounty0x should have simple tokens after destribution1", function() {
        Bounty0xEscrow.deployed().then(function(instance) {
            return instance.distributeTokenToAddressesAndAmounts("0x345ca3e014aaf5dca488057592ee47305d9b3e10", "0x627306090abab3a6e1400e9345bc60c78a8bef57", 100, ["0x1Dc4cf41Ce1f397033DeA502528b753b4D028009"], [10])
        }).then(function() { 
            assert.equal(0, 1, gas);
        }).then(function() {
            assert.equal(0, 1, gas);
        });
    });

});

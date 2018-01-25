import expectThrow from './helpers/expectThrow';

const SimpleToken = artifacts.require("SimpleToken");
const Bounty0xEscrow = artifacts.require("Bounty0xEscrow");


contract('Bounty0xEscrow', ([ owner, acct1, acct2, acct3, acct4, acct5 ]) => {
    let tokenContract;
    let tokenAddress;
    let bountyContract;

    before('get the deployed test token and Bounty0xEscrow', async () => {
        tokenContract = await SimpleToken.deployed();
        bountyContract = await Bounty0xEscrow.deployed();
        tokenAddress = tokenContract.address;
    });

    it('contracts should be deployed', async () => {
        assert.strictEqual(typeof tokenContract.address, 'string');
        assert.strictEqual(typeof bountyContract.address, 'string');
    });

    it('initial balance of owner should be 1 000 000 and of bountyContract - 0', async () => {
        let balanceOwner = await tokenContract.balanceOf(owner);
        let balanceBountyEscrow = await tokenContract.balanceOf(bountyContract.address);
        assert.strictEqual(balanceOwner.toNumber(), 1000000);
        assert.strictEqual(balanceBountyEscrow.toNumber(), 0);
    });

    it('should support Bounty0xToken by default and only it', async () => {
        const bountyTokenAddress = "0xd2d6158683aeE4Cc838067727209a0aAF4359de3".toLowerCase();
        let supportedTokens = await bountyContract.getListOfSupportedTokens();
        let isSupported = await bountyContract.tokenIsSupported(bountyTokenAddress);
        assert.strictEqual(supportedTokens.length, 1);
        assert.strictEqual(supportedTokens[0], bountyTokenAddress);
        assert.strictEqual(isSupported, true);
    });

    it('SimpleToken should not be supported', async () => {
        let isSupported = await bountyContract.tokenIsSupported(tokenContract.address);
        assert.strictEqual(isSupported, false);
    });

    it('addSupportedToken can only be called by owner', async () => {
        await expectThrow(bountyContract.addSupportedToken(tokenAddress, { from: acct1 }));
        await expectThrow(bountyContract.addSupportedToken(tokenAddress, { from: acct2 }));
        const { logs } = await bountyContract.addSupportedToken(tokenAddress, { from: owner });
        assert.strictEqual(logs.length, 0);
    });

    it('supported token should not be added', async () => {
        await expectThrow(bountyContract.addSupportedToken(tokenAddress));
    });

    it('removeSupportedToken can only be called by owner', async () => {
        let supportedTokens = await bountyContract.getListOfSupportedTokens();

        await expectThrow(bountyContract.removeSupportedToken(tokenAddress, { from: acct1 }));
        await expectThrow(bountyContract.removeSupportedToken(tokenAddress, { from: acct2 }));
        const { logs } = await bountyContract.removeSupportedToken(tokenAddress, { from: owner });
        assert.strictEqual(logs.length, 0);

        let supportedTokensAfter = await bountyContract.getListOfSupportedTokens();
        assert.strictEqual(supportedTokens.length - 1, supportedTokensAfter.length);

        let isSupported = await bountyContract.tokenIsSupported(tokenAddress);
        assert.strictEqual(isSupported, false);
    });

    it('not supported token should not be removed', async () => {
        await expectThrow(bountyContract.removeSupportedToken(tokenAddress));
    });

    it('should not deposit token witch is not supported', async () => {
        await expectThrow(bountyContract.depositToken(tokenAddress, 100000));
    });

    it('support SimpleToken again', async () => {
        const { logs } = await bountyContract.addSupportedToken(tokenAddress, { from: owner });
        assert.strictEqual(logs.length, 0);
    });

    it('should deposit token witch is supported', async () => {
        await tokenContract.approve(bountyContract.address, 100000);
        await bountyContract.depositToken(tokenAddress, 100000);
        let balanceDeposited = await bountyContract.tokens(tokenAddress, owner);
        assert.strictEqual(balanceDeposited.toNumber(), 100000);

        let bountyContractBalance = await tokenContract.balanceOf(bountyContract.address);
        assert.strictEqual(bountyContractBalance.toNumber(), 100000);
    });

    it('distributeTokenToAddressesAndAmounts can only be called by owner', async () => {
        const addresses = ['0x1Dc4cf41Ce1f397033DeA502528b753b4D028009', '0xeFAeF3A9b2bC9B1464c1F85715B6915de4EC659d', '0x874c3076A926447A4cD16979D5F532bEa94C9173', '0xc406901ee9f12939B039b7C1fCb980E1969132FE', '0xba6194E151572118904CBc4cF3d5100c4Cd18bA4', '0xB5cbb1b8A20a086857a95b7F157D3349a1304909', '0x11b6b351535e7b846d8300A7E0bF2e9cBEb47DC3', '0x8D24299E26572bb316c277C63291C43EEe1d6D4A', '0x50A72Df43b0121A9A81219727064E5E71b702AD1', '0x83A0e6Cc0105d64d9B8e77aE9C612644CE2Ccfc5', '0x9607A4A52BC8e1a031A28AFeb8B91588359e50F4', '0x9a13Efe96c24C0A28dFE3e4674b596b51D61D0f9', '0xdd3b68421009415916c9e4beff1e660cf0804b3a', '0x7bdf3dd86b9dc5B310b009e8e5708e0be785054A', '0x4eEB41BFC3A028AE1d5f82A23dE6ff64c17B3648', '0xD933d531D354Bb49e283930743E0a473FC8099Df', '0xE0733d8625Dc544DB6630FbACba2ACa7b5147c23', '0x459e03Ecbe6078F9981765b8E7dD2106C4E369DA', '0x9fcfe63108f0957aad1c6f2ed30270e8d35c6491', '0xEE06BdDafFA56a303718DE53A5bc347EfbE4C68f', '0x767e1d39817DaeAD1244AC590a15f4AEF12F510B', '0x1d325Cb54Ea237a2C2724E4eB72aC50Cd25D5Adf', '0x5274256f6d66407D37c5ec4553f440006e5f4057', '0xD9eB72a753e4A3C6863CBd709fD3f569A10979B7', '0xF6c843a82CB6aE65bfBB83A189B96F46BCE81784', '0x5Bd92778f0F937A6ddA0CD96311904827b887434', '0x55D1A4291128FD69954d503A54130c1e468Fb352', '0x9F57b5d8885E3506E767E3E3aFf9D7e3fa4fD3aF', '0xb290e60a9526c22b353ea842e70bb73e985e660b', '0xEbc9b73E6CEf821277d87BE2937504Ff94169d9F', '0x1d78010AE098d2DDFc01c7306F16776d1409A576', '0xE346dDdAE663a98639a984862C0c032CFb992721', '0x86bFfd1a876f657438ac20BD8b6fB3521F7B603D', '0xdE0D0299780d3f79Ab8Ee8ef4806776feeCCa756', '0x45305Ba40e1AED649278EbfFe02d0E329B64DE80', '0x8414DBB7B9Bf1B56216cf7cEf10ffA58c6626d4c', '0xA462B7226Cf95393c5a9Fcc102Cf5c2152331040', '0xb412B96Dbe138DA98be8e475f632E1A8F0037748', '0x9948fbc15178fB75DB75D9394E614AE5C847445f', '0x993D56aDBe3421E650045F8f3349c5036DD31A75', '0x3471C35C87b9BD871f1222B9b485607e1F39062d', '0x1415B4BB6C8ADD435941B0796294715454917dB3', '0xa596A01acb9e36ae574495dCED3922377ABbBb74', '0x2540bf2803a53B48A637573C54e396C97A79dE2E', '0x5b85988F0032ee818f911ec969Dd9c649CAa0a14', '0x99FE75276a934b9694b0401829ec4FDdEE748889', '0x3110F81f3D112da3B18557a64138bFC966c7BabB', '0x5c538fd3372ebebb0cf583ce514fcf9555d64543', '0xcB20AE5730DDD23704A7370ce6a10D2ba6f3f39C', '0x1D0676ab90E684E9c70c96a8691c2c993eEc2dA8', '0xe325cb1EF3b677744F056C5a6E17946e31Ff5538', '0x78d8e8807f652b54afe33b7645a26c5ffae5291c'];
        const amounts = [100, 22, 231, 342, 312, 1231, 1231, 2334, 657, 787, 978, 574, 636, 687, 563, 53, 445, 476, 876, 34, 53, 556, 87, 987, 98, 5, 8, 679, 85, 6, 35, 234, 234, 346, 5, 767, 867, 44, 434, 6546, 57, 56876, 867, 86, 78, 466, 32, 37, 87, 98, 76, 20];
        let totalAmount = amounts.reduce((a, b) => a + b, 0);

        await expectThrow(bountyContract.distributeTokenToAddressesAndAmounts(tokenAddress, owner, totalAmount, addresses, amounts, { from: acct1 }));
        await expectThrow(bountyContract.distributeTokenToAddressesAndAmounts(tokenAddress, owner, totalAmount, addresses, amounts, { from: acct2 }));
        const { logs } = await bountyContract.distributeTokenToAddressesAndAmounts(tokenAddress, owner, totalAmount, addresses, amounts, { from: owner });
        assert.strictEqual(logs.length, addresses.length);

        for (var i = 0; i < addresses.length; i++) {
            let balanceOfAddress = await tokenContract.balanceOf(addresses[i]);
            assert.equal(amounts[i], balanceOfAddress.toNumber());
        }

        let balanceHostAfterDestribution = 100000 - amounts.reduce((a, b) => a + b, 0);
        let tokenBalanceHostOnEscrow = await bountyContract.tokens(tokenAddress, owner);
        assert.equal(balanceHostAfterDestribution, tokenBalanceHostOnEscrow.toNumber());
    });

    it('distributeTokenToAddress can only be called by owner', async () => {
        const address = '0x1Dc4cf41Ce1f397033DeA502528b753b4D028777';
        const amount = 100;
        let initialBalanceHost = await bountyContract.tokens(tokenAddress, owner);

        await expectThrow(bountyContract.distributeTokenToAddress(tokenAddress, owner, address, amount, { from: acct1 }));
        await expectThrow(bountyContract.distributeTokenToAddress(tokenAddress, owner, address, amount, { from: acct2 }));
        const { logs } = await bountyContract.distributeTokenToAddress(tokenAddress, owner, address, amount, { from: owner });
        assert.strictEqual(logs.length, 1);

        let balanceOfAddress = await tokenContract.balanceOf(address);
        assert.equal(amount, balanceOfAddress.toNumber());

        let tokenBalanceHostOnEscrow = await bountyContract.tokens(tokenAddress, owner);
        assert.equal(initialBalanceHost - 100, tokenBalanceHostOnEscrow.toNumber());
    });

});

pragma solidity ^0.4.11;

import './interfaces/ERC223_token.sol';


contract SimpleERC223Token is ERC223Token {

    string public constant name = "SimpleToken";
    string public constant symbol = "SIM";
    uint8 public constant decimals = 0;

    uint256 public constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(decimals));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    function SimpleERC223Token() public {
      totalSupply = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
    }

}

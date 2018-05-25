pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './interfaces/ERC223_receiving_contract.sol';


contract Bounty0xEscrow is Ownable, ERC223ReceivingContract, Pausable {

    using SafeMath for uint256;

    mapping (address => mapping (address => uint)) public tokens; //mapping of token addresses to mapping of account balances (token=0 means Ether)

    event Deposit(address token, address user, uint amount, uint balance);
    event Distribution(address token, address host, address hunter, uint256 amount, uint64 timestamp);


    constructor() public {
        
    }

    // for erc223 tokens
    function tokenFallback(address _from, uint _value, bytes _data) public whenNotPaused {
        address _token = msg.sender;

        tokens[_token][_from] = SafeMath.add(tokens[_token][_from], _value);
        emit Deposit(_token, _from, _value, tokens[_token][_from]);
    }

    // for erc20 tokens 
    function depositToken(address _token, uint _amount) public whenNotPaused {
        //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
        require(_token != address(0));

        require(ERC20(_token).transferFrom(msg.sender, this, _amount));
        tokens[_token][msg.sender] = SafeMath.add(tokens[_token][msg.sender], _amount);

        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }


    function distributeTokenToAddress(address _token, address _host, address _hunter, uint256 _amount) external onlyOwner {
        require(_token != address(0));
        require(_hunter != address(0));
        require(tokens[_token][_host] >= _amount);

        tokens[_token][_host] = SafeMath.sub(tokens[_token][_host], _amount);
        require(ERC20(_token).transfer(_hunter, _amount));

        emit Distribution(_token, _host, _hunter, _amount, uint64(now));
    }

    function distributeTokenToAddressesAndAmounts(address _token, address _host, address[] _hunters, uint256[] _amounts) external onlyOwner {
        require(_token != address(0));
        require(_host != address(0));
        require(_hunters.length == _amounts.length);

        uint256 totalAmount = 0;
        for (uint j = 0; j < _amounts.length; j++) {
            totalAmount = SafeMath.add(totalAmount, _amounts[j]);
        }
        require(tokens[_token][_host] >= totalAmount);
        tokens[_token][_host] = SafeMath.sub(tokens[_token][_host], totalAmount);

        for (uint i = 0; i < _hunters.length; i++) {
            require(ERC20(_token).transfer(_hunters[i], _amounts[i]));

            emit Distribution(_token, _host, _hunters[i], _amounts[i], uint64(now));
        }
    }

    function distributeTokenToAddressesAndAmountsWithoutHost(address _token, address[] _hunters, uint256[] _amounts) external onlyOwner {
        require(_token != address(0));
        require(_hunters.length == _amounts.length);

        uint256 totalAmount = 0;
        for (uint j = 0; j < _amounts.length; j++) {
            totalAmount = SafeMath.add(totalAmount, _amounts[j]);
        }
        require(ERC20(_token).balanceOf(this) >= totalAmount);

        for (uint i = 0; i < _hunters.length; i++) {
            require(ERC20(_token).transfer(_hunters[i], _amounts[i]));

            emit Distribution(_token, this, _hunters[i], _amounts[i], uint64(now));
        }
    }
    
    function distributeWithTransferFrom(address _token, address _ownerOfTokens, address[] _hunters, uint256[] _amounts) external onlyOwner {
        require(_token != address(0));
        require(_hunters.length == _amounts.length);

        uint256 totalAmount = 0;
        for (uint j = 0; j < _amounts.length; j++) {
            totalAmount = SafeMath.add(totalAmount, _amounts[j]);
        }
        require(ERC20(_token).allowance(_ownerOfTokens, this) >= totalAmount);

        for (uint i = 0; i < _hunters.length; i++) {
            require(ERC20(_token).transferFrom(_ownerOfTokens, _hunters[i], _amounts[i]));

            emit Distribution(_token, this, _hunters[i], _amounts[i], uint64(now));
        }
    }
    
    // in case of emergency
    function approveToPullOutTokens(address _token, address _receiver, uint256 _amount) external onlyOwner {
        ERC20(_token).approve(_receiver, _amount);
    }
    
}

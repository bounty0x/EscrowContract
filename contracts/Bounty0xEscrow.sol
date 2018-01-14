pragma solidity ^0.4.18;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}




/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) public constant returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) public constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}




/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  function Ownable() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }
}




contract Bounty0xEscrow is Ownable {

    using SafeMath for uint256;

    struct Distribution {
        address token;
        address sender;
        address reciever;
        uint256 amount;
        uint64 timestamp;
    }

    address[] supportedTokens;
    Distribution[] distributions;

    mapping (address => bool) public tokenIsSupported;
    mapping (address => mapping (address => uint)) public tokens; //mapping of token addresses to mapping of account balances (token=0 means Ether)

    event NewDeposit(address token, address user, uint amount, uint balance);
    event NewDistribution(address token, address host, address hunter, uint256 amount, uint64 timestamp);


    function Bounty0xEscrow() public {
        address Bounty0xToken = 0xd2d6158683aeE4Cc838067727209a0aAF4359de3;
        supportedTokens.push(Bounty0xToken);
        tokenIsSupported[Bounty0xToken] = true;
    }


    function addSupportedToken(address _token) public onlyOwner {
        require(!tokenIsSupported[_token]);
        supportedTokens.push(_token);
        tokenIsSupported[_token] = true;
    }


    function depositToken(address _token, uint _amount) public {
        //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
        require(_token != address(0));
        require(tokenIsSupported[_token]);
        require(ERC20(_token).transferFrom(msg.sender, this, _amount));
        tokens[_token][msg.sender] = SafeMath.add(tokens[_token][msg.sender], _amount);
        NewDeposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }


    function distributeTokenToAddressesAndAmounts(address _token, address _host, uint256 _totalAmount, address[] _hunters, uint256[] _amounts) external onlyOwner {
        require(_token != address(0));
        require(_host != address(0));
        require(_hunters.length == _amounts.length);
        require(tokenIsSupported[_token]);
        require(tokens[_token][_host] >= _totalAmount);

        tokens[_token][_host] = SafeMath.sub(tokens[_token][_host], _totalAmount);
        for (uint i = 0; i < _hunters.length; i++) {
            require(ERC20(_token).transfer(_hunters[i], _amounts[i]));

            Distribution memory newDist = Distribution({
                token: _token,
                sender: _host,
                reciever: _hunters[i],
                amount: _amounts[i],
                timestamp: uint64(now)
            });

            distributions.push(newDist);

            NewDistribution(_token, _host, _hunters[i], _amounts[i], uint64(now));
        }
    }


    function distributeTokenToAddress(address _token, address _host, address _hunter, uint256 _amount) external onlyOwner {
        require(_token != address(0));
        require(_hunter != address(0));
        require(tokenIsSupported[_token]);
        require(tokens[_token][_host] >= _amount);

        tokens[_token][_host] = SafeMath.sub(tokens[_token][_host], _amount);
        require(ERC20(_token).transfer(_hunter, _amount));

        Distribution memory newDist = Distribution({
            token: _token,
            sender: _host,
            reciever: _hunter,
            amount: _amount,
            timestamp: uint64(now)
        });

        distributions.push(newDist);

        NewDistribution(_token, _host, _hunter, _amount, uint64(now));
    }


    function getListOfSupportedTokens() view public returns(address[]) {
        return supportedTokens;
    }

    function numberOfDistributions() view public returns(uint256) {
        return distributions.length;
    }

    function getDistribution(uint256 _id) view public returns(address, address, address, uint256, uint64) {
        require(_id < distributions.length);
        Distribution storage dist = distributions[_id];
        return (
            dist.token,
            dist.sender,
            dist.reciever,
            dist.amount,
            dist.timestamp
        );
    }

}

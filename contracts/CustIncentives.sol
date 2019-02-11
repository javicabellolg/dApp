pragma solidity 0.4.24;

import './Ownable.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Incentives is Ownable{
    using SafeMath for uint;
    
    uint pointsToAdd;

    struct Point{
        uint points;
        bool discount;
    }

    mapping (address => Point) public incentives;
    mapping (address => bool) private userEnables;

    constructor() public{
        pointsToAdd = 1;
    }

    function enableUsers (address _address) public onlyOwner{
        userEnables[_address] = true;
    }

    function addPoints (address _client) public {
        require(userEnables[msg.sender]);
        incentives[_client].points = incentives[_client].points.add(pointsToAdd);
        if (incentives[_client].points == 10){
            incentives[_client].discount = true;
        } else { incentives[_client].discount = false; }
    }

    function increasePointsToAdd (uint8 _points) public onlyOwner{
        pointsToAdd = _points;
    }

}
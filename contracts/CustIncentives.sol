pragma solidity 0.4.24;

import './Ownable.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Incentives is Ownable{
    using SafeMath for uint;
    
    uint pointsToAdd;

    event pointedUser (string msg, address user, address notifier);

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

    modifier userEnable {
	require(userEnables[msg.sender], "Usted no está habilitado para realizar esta operación");
	_;
    }

    function addPoints (address _client) public userEnable{
        require(userEnables[msg.sender], "Usted no está habilitado para realizar esta operación");
        incentives[_client].points = incentives[_client].points.add(pointsToAdd);
	emit pointedUser("Punto añadido al usuario", _client, msg.sender);
        if (incentives[_client].points == 10){
            incentives[_client].discount = true;
        } else { incentives[_client].discount = false; }
    }

    function resetPoints (address _client) public userEnable{
	incentives[_client].points = 0;
	emit pointedUser("Puntos reseteados al usuario", _client, msg.sender);
    }    

    function increasePointsToAdd (uint8 _points) public onlyOwner{
        pointsToAdd = _points;
    }

}

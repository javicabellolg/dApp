pragma solidity 0.4.24;

import './Ownable.sol';
//import './SafeMath.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Incentives is Ownable{
    using SafeMath for uint;
    
    uint pointsToAdd;
    bool isStopped = false;

    event pointedUser (string msg, address user, address notifier);

    struct Point{
        uint points;
        bool discount;
    }

    mapping (address => Point) public incentives;
    mapping (address => bool) private userEnables;

    modifier stoppedInEmergency {
        require(!isStopped, "El contrato está parado");
        _;
    }

    modifier userEnable {
	require(userEnables[msg.sender], "Usted no está habilitado para realizar esta operación");
	_;
    }

    constructor() public{
        pointsToAdd = 1;
    }

    function enableUsers (address _address) public stoppedInEmergency onlyOwner{
        userEnables[_address] = true;
    }

    function addPoints (address _client) public stoppedInEmergency userEnable{
        require(userEnables[msg.sender], "Usted no está habilitado para realizar esta operación");
        incentives[_client].points = incentives[_client].points.add(pointsToAdd);
	emit pointedUser("Punto añadido al usuario", _client, msg.sender);
        if (incentives[_client].points == 10){
            incentives[_client].discount = true;
        } else { incentives[_client].discount = false; }
    }

    function resetPoints (address _client) public stoppedInEmergency userEnable{
	incentives[_client].points = 0;
	incentives[_client].discount = false;
	emit pointedUser("Puntos reseteados al usuario", _client, msg.sender);
    }    

    function increasePointsToAdd (uint8 _points) public stoppedInEmergency onlyOwner{
        pointsToAdd = _points;
    }

    function enableToDiscount(address _client) public returns(bool){
	return (incentives[_client].discount);
    }

    //Función que para el contrato en caso de emergencia.
    function stopContract() public onlyOwner {
        isStopped = true;
    }

}

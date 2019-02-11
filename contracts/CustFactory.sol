////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//		Nombre: CustFactory.sol
//		Autor: Javier Cabello Laguna
//		Version: 0.1
//		Descripción:
//			Factory Contract para la creación de nuevos requerimientos de cobro. Se creará un requerimiento de cobro por cada compra. Estos requerimientos de cobro pueden ser
//          satisfechos en el momento o aplazados.		
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

pragma solidity 0.4.24;

import "./CreatePays.sol";
import "./Ownable.sol";

contract createPaysInterface{
    function checkMaxPenalized (address _client) public returns (bool);
    function checkAmount (address _client) public returns (uint);
}

contract incentivesInterface{
    function addPoints (address _client) public;
}

contract CustFactory is Ownable{
    struct black{
        address notifier;
        uint amount;
    }

    mapping(uint => address) public idToOwner;
    mapping (address => bool) public permissions;
    mapping (address => black) public blacklist;

    createPaysInterface public checkBlackListed;
    incentivesInterface public incentives;

    function createPayContract(uint _id, address _client, uint _amount, uint _timeExtra) public onlyOwner {
        if (idToOwner[_id] == 0 && blacklist[_client].amount == 0) {
            idToOwner[_id] = new createPays(_client, msg.sender, _id, _amount, now, now + _timeExtra);  // Hay que tener en cuenta que realmente el mapping relaciona el id con el address del contrato que se genera. El Owner del contrato es el msg.sender, siendo este únicamente el proveedor.
            incentives.addPoints(_client);
        }
        //PONER UN ELSE CON UN EVENTO QUE INDIQUE QUE NO SE HA CREADO EL CONTRATO
    }

    function permissionAdd(address _address) public onlyOwner{
        permissions[_address] = true;
    }

    function addToBlackList(address _client, uint _id) public {
        require (permissions[msg.sender]);
        checkBlackListed = createPaysInterface(idToOwner[_id]);
        require(checkBlackListed.checkMaxPenalized(_client));
        blacklist[_client].notifier = msg.sender;
        blacklist[_client].amount = checkBlackListed.checkAmount(_client);
    }

    function deleteFromBlackList(address _client, uint _id) public {
        require (permissions[msg.sender]);
        checkBlackListed = createPaysInterface(idToOwner[_id]);
        require (checkBlackListed.checkAmount(_client) == 0);
        delete blacklist[_client];
    }

    function setIncentiveContract(address _address) external{
        incentives = incentivesInterface(_address);
    }

    function bye_bye() external onlyOwner {
        selfdestruct(msg.sender);
    }
}
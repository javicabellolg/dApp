////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//		Nombre: CreaateBills.sol
//		Autor: Javier Cabello Laguna
//		Version: 0.2
//		Descripción:
//			Contratos creados para gestión de pagos de requerimientos de cobro.		
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
pragma solidity 0.4.24;

import "./Ownable.sol";
//import "./CustToken.sol";
import "./Tokens.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CustTokenInterface{
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract incentivesInterface_Pays{
    function addPoints (address _client) public;
}

contract createPays is Ownable{

    using SafeMath for uint;
    uint16 convRate = 1;
    uint initialDebt;
    uint value;
    uint penalizedValue;
    bool penalized1 = true;
    bool penalized2 = true;
    bool penalized3 = true;
    bool penalized4 = true;
    bool penalized5 = true;
    bool penalized6 = true;

    CustTokenInterface public custoken;
    incentivesInterface_Pays public incentives;

    // Definicion de Eventos

    event billRegister (uint billId, uint billAmount, address billRequest);
    event billStatus (uint amount);

    // Definicion de Estructuras

    struct Bill {
        uint id;
        uint amount;
        address ownerSupply;
        uint createdBill;
        uint expiresBill;
        bool penalized;
        bool blacklisted;
    }

    Bill[] public bills;

    mapping (address => Bill) public ownerBill;
    mapping (address => bool) public enableTokens;

    constructor(address _client, address _supplyerAddress, uint _id, uint _amount, uint _created, uint _expires, address _Tokens) public {
        owner = _supplyerAddress;
        ownerBill[_client].id = _id;
        ownerBill[_client].amount = _amount;
        initialDebt = _amount;
        ownerBill[_client].ownerSupply = _supplyerAddress;
        ownerBill[_client].createdBill = _created;
        ownerBill[_client].expiresBill = _expires;
        ownerBill[_client].penalized = false;
        ownerBill[_client].blacklisted = false;
        emit billRegister(_id, _amount, _client);

	custoken = CustTokenInterface(_Tokens);
        enableTokens[_Tokens] = true;
    }

    modifier evaluateExpires(address _client){
        //uint _amountPenalized;
        if (now >= ownerBill[_client].expiresBill){
            ownerBill[_client].penalized = true;
            if (now < ownerBill[_client].expiresBill + 1 minutes){ require (penalized1,"Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(1).div(100); penalized1 = false;}
            else if (now >= ownerBill[_client].expiresBill + 1 minutes){
                if (now < ownerBill[_client].expiresBill + 5 minutes) { require (penalized2, "Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(2).div(100); penalized2 = false;}
                else if (now >= ownerBill[_client].expiresBill + 5 minutes){
                    if (now < ownerBill[_client].expiresBill + 7 minutes) { require (penalized3, "Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(5).div(100); penalized3 = false;}
                    else if (now >= ownerBill[_client].expiresBill + 7 minutes){
                        if (now < ownerBill[_client].expiresBill + 8 minutes) { require (penalized4, "Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(8).div(100); penalized4 = false;}
                        else if (now >= ownerBill[_client].expiresBill + 8 minutes){
                            if (now < ownerBill[_client].expiresBill + 10 minutes) { require (penalized5, "Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(15).div(100); penalized5 = false;}
                            else if (now >= ownerBill[_client].expiresBill + 10 minutes){
                                require (penalized6); 
                                penalizedValue = initialDebt.mul(20).div(100);
                                ownerBill[_client].blacklisted = true; // Se habilita inscripción en blacklist
                            }
                        }
                    }
                }
            }
        }
        else { penalizedValue = 0; }
        _;
    }

    modifier paying(address _client, uint _amount) {
        require(custoken.balanceOf(_client) >= _amount, "El balance no es suficiente para efectuar el pago");
        custoken.transfer(ownerBill[_client].ownerSupply, _amount);
        ownerBill[_client].amount = ownerBill[_client].amount.sub(_amount);
        emit billStatus(ownerBill[_client].amount);
        _;
    }    

    function payingWithToken(address _client, uint _amount) external payable evaluateExpires (_client) paying (_client, _amount) returns (uint) {
        ownerBill[_client].amount = ownerBill[_client].amount.add(penalizedValue);
        penalizedValue = 0;
        emit billStatus(ownerBill[_client].amount);
        address(ownerBill[msg.sender].ownerSupply).transfer(msg.value);
        value = msg.value;
        ownerBill[_client].amount = ownerBill[_client].amount.sub(value);
        if (ownerBill[_client].amount == 0) {
            delete ownerBill[msg.sender];
	}
        emit billStatus(ownerBill[_client].amount);
        return (ownerBill[_client].amount);
    }

    function supplyerAddress(address _client) public returns (address){
        return (ownerBill[_client].ownerSupply);
    }

    function setJCLTokenContractAddress(address _address) external {
        require (enableTokens[_address], "La dirección que ha introducido no está habilitada para efectuar pagos");
        custoken = CustTokenInterface(_address);
    }

    function checkMaxPenalized (address _client) public returns (bool){
        return (ownerBill[_client].blacklisted);
    }

    function checkAmount (address _client) public returns (uint){
        return (ownerBill[_client].amount);
    }
    
    function bye_bye() external onlyOwner {
        selfdestruct(msg.sender);
    }		

    function () public payable{
        revert();
    }

}

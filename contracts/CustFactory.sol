pragma solidity 0.4.24;

import "./Ownable.sol";
import "./Tokens.sol";
//import "./SafeMath.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Definición de Interfaces necesarias para los contratos principales.
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
    function resetPoints (address _client) public;
}

contract createPaysInterface{
    function checkMaxPenalized (address _client) public returns (bool);
    function checkAmount (address _client) public returns (uint);
}

contract incentivesInterface{
    function addPoints (address _client) public;
    function resetPoints (address _client) public;
    function enableToDiscount(address _client) public returns(bool);
}

contract usuariosInterface{
    function userActiveState (address _address) public view returns (bool);
}

contract merchantInterface{
    function merchantActiveStatus (address _address) public view returns (bool);
}

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

contract CustFactory is Ownable{

    using SafeMath for uint;
    uint discountGen = 5;
    uint percentage = 100;

    // Indicador del estado del contrato.
    bool isStopped = false;

    // Iniciación de Interfaces
    usuariosInterface public usuarioActivo;
    merchantInterface public merchantActivo;
    createPaysInterface public checkBlackListed;
    incentivesInterface public incentives;

    event billCreationStatus (string errMsg, uint id, address client);
    event blackListed (string Msg, address user, uint amount, address notifier);
    event eventUser (bool status, address user);

    struct black{
        address notifier;
        uint amount;
    }

    mapping(uint => address) public idToOwner;
    mapping (address => bool) public permissions;
    mapping (address => black) public blacklist;

    //Modificador que comprueba que solo pueda ejecutar la función si el contrato no está parado. Incluyo mensaje como buenas prácticas.
    modifier stoppedInEmergency {
        require(!isStopped, "El contrato está parado");
        _;
    }

    modifier permissionAddToBlacklist{
	require (permissions[msg.sender], "Usted no está habilitado para realizar esta acción");
	_;
    }

    modifier requireUser(address _client){
    emit eventUser (usuarioActivo.userActiveState(_client), _client);
    require (usuarioActivo.userActiveState(_client), "El usuario no está dado de alta en el sistema");
    	_;
    }

    modifier requireMerchant {
	require (merchantActivo.merchantActiveStatus(msg.sender), "El merchant no está dado de alta en el sistema");
    	_;
    }

    function createPayContract(uint _id, address _client, uint _amount, uint _timeExtra, address _tokenAddress) public stoppedInEmergency requireUser(_client) requireMerchant {
	if (idToOwner[_id] == 0 && blacklist[_client].amount == 0 && incentives.enableToDiscount(_client) == true) {
	    idToOwner[_id] = new createPays(_client, msg.sender, _id, _amount.sub(_amount.mul(discountGen).div(percentage)), now, now + _timeExtra, _tokenAddress);  // Hay que tener en cuenta que realmente el mapping relaciona el id con el address del contrato que se genera. El Owner del contrato es el msg.sender, siendo este únicamente el proveedor.
            incentives.resetPoints(_client);
	    emit billCreationStatus ("El requerimiento de cobro se ha creado satisfactoriamente", _id, _client);
        } else if (idToOwner[_id] == 0 && blacklist[_client].amount == 0 && incentives.enableToDiscount(_client) == false){
	    idToOwner[_id] = new createPays(_client, msg.sender, _id, _amount, now, now + _timeExtra, _tokenAddress);  // Hay que tener en cuenta que realmente el mapping relaciona el id con el address del contrato que se genera. El Owner del contrato es el msg.sender, siendo este únicamente el proveedor.
            incentives.addPoints(_client);
            emit billCreationStatus ("El requerimiento de cobro se ha creado satisfactoriamente", _id, _client);
        } 
        else { emit billCreationStatus ("El requerimiento de cobro no ha podido crearse. El id de la factura está duplicado o el usuario está incluído en la blacklist.", _id, _client);} 
    }

    function permissionAdd(address _address) public requireMerchant{
        permissions[_address] = true;
    }

    function addToBlackList(address _client, uint _id) external permissionAddToBlacklist {
        checkBlackListed = createPaysInterface(idToOwner[_id]);
        require(checkBlackListed.checkMaxPenalized(_client), "Todavía no ha pasado el tiempo necesario para incluir al cliente en la blacklist");
        blacklist[_client].notifier = msg.sender;
        blacklist[_client].amount = checkBlackListed.checkAmount(_client);
	incentives.resetPoints(_client);
	emit blackListed ("Usuario añadido a la blacklist", _client, blacklist[_client].amount, blacklist[_client].notifier);
    }

    function deleteFromBlackList(address _client, uint _id) external permissionAddToBlacklist {
        checkBlackListed = createPaysInterface(idToOwner[_id]);
        require (checkBlackListed.checkAmount(_client) == 0, "El cliente no ha satisfecho sus deudas, No puede borrarse de la blacklist");
        delete blacklist[_client];
    }

    function setIncentiveContract(address _address) external{
        incentives = incentivesInterface(_address);
    }

    function setClientMerchantContracts(address _client, address _merchant) public{
	usuarioActivo = usuariosInterface(_client);
	merchantActivo = merchantInterface(_merchant);
    }

    function changeDiscount(uint _newDiscount) external onlyOwner{
	discountGen = _newDiscount;
    }

    //Función que para el contrato en caso de emergencia.
    function stopContract() public onlyOwner {
        isStopped = true;
    }
    
    //Función que arranca el contrato en caso de emergencia.
    function resumeContract() public onlyOwner {
        isStopped = false;
    }

    function bye_bye() external onlyOwner {
        selfdestruct(msg.sender);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//		Nombre: createPays
//		Autor: Javier Cabello Laguna
//		Version: 0.1
//		Descripción:
//			Factory Contract para la creación de nuevos requerimientos de cobro. Se creará un requerimiento de cobro por cada compra. Estos requerimientos de cobro pueden ser
//          satisfechos en el momento o aplazados.		
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
    // Indicador del estado del contrato.
    bool isStopped = false;

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
    mapping (address => bool) enableTokens;

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

    //Modificador que comprueba que solo pueda ejecutar la función si el contrato no está parado. Incluyo mensaje como buenas prácticas.
    modifier stoppedInEmergency {
        require(!isStopped, "El contrato está parado");
        _;
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
                        if (now < ownerBill[_client].expiresBill + 8 minutes) { require (penalized4, "Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(12).div(100); penalized4 = false;}
                        else if (now >= ownerBill[_client].expiresBill + 8 minutes){
                            if (now < ownerBill[_client].expiresBill + 10 minutes) { require (penalized5, "Usted ya ha efectuado el intento de pago y no ha abonado la cantidad adeudada"); penalizedValue = initialDebt.mul(20).div(100); penalized5 = false;}
                            else if (now >= ownerBill[_client].expiresBill + 10 minutes){
                                require (penalized6); 
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

    function payingWithToken(address _client, uint _amount) external payable stoppedInEmergency evaluateExpires (_client) paying (_client, _amount) returns (uint) {
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

    //Función que para el contrato en caso de emergencia.
    function stopContract() public onlyOwner {
        isStopped = true;
    }
    
    //Función que arranca el contrato en caso de emergencia.
    function resumeContract() public onlyOwner {
        isStopped = false;
    }

    function supplyerAddress(address _client) public view returns (address){
        return (ownerBill[_client].ownerSupply);
    }

    function setJCLTokenContractAddress(address _address) external view {
        require (enableTokens[_address], "La dirección que ha introducido no está habilitada para efectuar pagos");
        custoken = CustTokenInterface(_address);
    }

    function checkMaxPenalized (address _client) public view returns (bool){
        return (ownerBill[_client].blacklisted);
    }

    function checkAmount (address _client) public view returns (uint){
        return (ownerBill[_client].amount);
    }
    
    function bye_bye() external onlyOwner {
        selfdestruct(msg.sender);
    }		

    function () public payable{
        revert();
    }

}

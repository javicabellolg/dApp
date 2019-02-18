pragma solidity ^0.4.24;

/**
 * @title Gestión de usuarios
 * @dev Con este contrato se dan de alta,baja y modificación a los usuarios en la plataforma.
 */

contract Usuarios {

    // Propietario del contrato.
    address public owner;
    
    // Indicador del estado del contrato.
    bool isStopped = false;

    // Struct donde se almacena la información del usuario.
    struct User {
        uint info;
    }

    // Mapeo la información con su correspondiente dirección.
    mapping (address => User) userStructs;
    mapping (address => bool) userActive;    

    // Array de direcciones.
    address[] public userAddresses;
    
    // Función que comprueba que el sender de la acción es el propietario del contrato.
    modifier onlyOwner () {
        require(msg.sender == owner, "Sender no autorizado");
        _;
    }

    //Modificador que comprueba que solo pueda ejecutar la función si el contrato no está parado. Incluyo mensaje como buenas prácticas.
    modifier stoppedInEmergency {
        require(!isStopped, "El contrato está parado");
        _;
    }
    
    // Constructor del contrato.
    constructor() public
    {
        owner = msg.sender;
    }
    
    // Función que realiza la creación de un nuevo usuario.
    function createUser(address _direccion) public onlyOwner stoppedInEmergency{
        
        //Compruebo si el usuario ya existe en la plataforma
        require(getInfo(_direccion) == 0, "Usuario ya existente");
        
        // Guardo la información de un usuario.
        userStructs[_direccion].info = uint(keccak256(abi.encodePacked(now, _direccion)));
        // Almaceno la dirección del usuario en el array de direcciones.
        userAddresses.push(_direccion);
	userActive[_direccion] = true;
    
    }
    
    // Función que realiza la actualización de un usuario.
    function updateInfo (address _direccion) public onlyOwner stoppedInEmergency{
        
        // Actualizo la información almacenada en el struct.
        userStructs[_direccion].info = uint(keccak256(abi.encodePacked(now, _direccion)));
    }

    // Función que realiza el borrado de un usuario.
    function removeInfo (address _direccion) public onlyOwner stoppedInEmergency{
        delete userStructs[_direccion];
    }
    
    // Función que realiza la consulta de la información de un usuario.
    function getInfo (address _direccion) public view returns (uint) {
        return (
            userStructs[_direccion].info
            );
    }

    // Función para comprobar si el usuario está dado de alta en la aplicación.
    function userActiveState (address _address) public view returns (bool) {
    	return(userActive[_address]);
    }

    //Función que para el contrato en caso de emergencia.
    function stopContract() public onlyOwner {
        isStopped = true;
    }
    
    //Función que arranca el contrato en caso de emergencia.
    function resumeContract() public onlyOwner {
        isStopped = false;
    }

}

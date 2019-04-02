var CustToken = artifacts.require('./Tokens.sol')
var CustFactory = artifacts.require('./CustFactory.sol')
var ConvertLib = artifacts.require('./ConvertLib.sol')
var Incentives = artifacts.require('./Incentives.sol')
var Usuarios = artifacts.require('./Usuarios.sol')
var Merchant = artifacts.require('./Merchant.sol')
var DAO = artifacts.require('./DAO.sol')

module.exports = function (deployer){
  var addressIncentives;
  var instanceIncentives;
  var instanceCustFactory;
  var addressDAO;
  var instanceDAO;
  
  deployer.deploy(DAO, 1, 10, 0).then(function(_instanceDAO){
    addressDAO = _instanceDAO.address;
    instanceDAO = _instanceDAO;
  });
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, CustToken)
  deployer.deploy(CustToken, 10000000, "Custom_Token", "CTKN");
  deployer.deploy(Incentives).then(function(_instance){
    addressIncentives = _instance.address;
    instanceIncentives = _instance;
  });
  deployer.deploy(CustFactory).then(function(_address){
    instanceCustFactory = _address;
    instanceCustFactory.setIncentiveContract(addressIncentives).then(function(){
      instanceIncentives.enableUsers(instanceCustFactory.address).then(function(){
        console.log("Finalizada la inicialización")
      });
    });
    instanceDAO.setInterfaceToBlacklist(instanceCustFactory.address).then(function(){
      console.log("Seteada Interfaz en DAO")
    });
  });
  console.log("Ha finalizado la importación de contratos")
  //deployer.deploy(CreatePays, "0x03", "0x00", 1, 1, 1, 1, "0x000");
  var userAddress;
  deployer.deploy(Usuarios).then(function (instance) {userAddress = instance.address;});
  deployer.deploy(Merchant).then(function (instanceMerchant) {
        instanceMerchant.createMerchant("0x21Ebf4dEe6f30042081e545f328ff55EEa51024F")
	CustFactory.deployed().then(async (instanceFactory) => {
                console.log (userAddress)
                await instanceFactory.setClientMerchantContracts(userAddress, instanceMerchant.address);
        	await instanceCustFactory.permissionAdd(instanceDAO.address).then(function(){
      			console.log("Habilitados permisos en DAO")
    		});
	});
  });
}

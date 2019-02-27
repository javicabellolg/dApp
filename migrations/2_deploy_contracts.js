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
  deployer.deploy(DAO, 1, 10, 0);
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
  });
  console.log("Ha finalizado la importación de contratos")
  //deployer.deploy(CreatePays, "0x03", "0x00", 1, 1, 1, 1, "0x000");
  var userAddress;
  deployer.deploy(Usuarios).then(function (instance) {userAddress = instance.address;});
  deployer.deploy(Merchant).then(function (instanceMerchant) {
        CustFactory.deployed().then(async (instanceFactory) => {
		console.log (userAddress)
                await instanceFactory.setClientMerchantContracts(userAddress, instanceMerchant.address);
        });
  });
}

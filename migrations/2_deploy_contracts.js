var CustToken = artifacts.require('./CustToken.sol')
var CustFactory = artifacts.require('./CustFactory.sol')
var CreatePays = artifacts.require('./CreatePays.sol')
var Incentives = artifacts.require('./Incentives.sol')

module.exports = function (deployer){
  var addressIncentives;
  var instanceIncentives;
  var instanceCustFactory;
  deployer.deploy(CustToken);
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
  deployer.deploy(CreatePays, "0x03", "0x00", 1, 1, 1, 1, "0x000");
}

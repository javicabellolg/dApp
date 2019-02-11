//var CustToken = artifacts.require('./CustToken.sol')
var CustFactory = artifacts.require('./CustFactory.sol')
var CreatePays = artifacts.require('./createPays.sol')
var Incentives = artifacts.require('./Incentives.sol')

module.exports = function (deployer) {
  //deployer.deploy(CustToken);
  deployer.deploy(CustFactory);
  deployer.deploy(CreatePays, "0x03", "0x00", 1, 1, 1, 1);
  deployer.deploy(Incentives)
}

// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "average aunt very upper solar pet orange engine excess find ranch spawn";

module.exports = {
  plugins: [ "truffle-security" ],
  networks: {
    ganache: {
      host: '127.0.0.1',
      port: 8545,
      gas:"290000000",
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/b8e3396d914f4e74af874ebaed2d634e")
      },
      network_id: 4
    }
  }
}

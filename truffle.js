// Allows us to use ES6 in our migrations and tests.
require('babel-register')
require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");

var walletMnemonic = process.env["MNEMONIC"];
var apiKey = process.env["API_KEY"];

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
        //return new HDWalletProvider(walletMnemonic, "https://rinkeby.infura.io/v3/b8e3396d914f4e74af874ebaed2d634e")
        return new HDWalletProvider(walletMnemonic, "https://rinkeby.infura.io/v3/"+apiKey)
      },
      network_id: 4
    }
  }
}

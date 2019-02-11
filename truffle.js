// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    ganache: {
      host: '127.0.0.1',
      port: 8545,
      gas:"290000000",
      network_id: '*' // Match any network id
    }
  }
}

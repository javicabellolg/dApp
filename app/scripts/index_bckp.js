// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import JCLTokenArtifact from '../../build/contracts/JCLToken.json'
import FactoryArtifact from '../../build/contracts/JCLFactory.json' 
import CreateArtifact from '../../build/contracts/CreateBills.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const JCLCoin = contract(JCLTokenArtifact)
const Factory = contract(FactoryArtifact)
const Create = contract(CreateArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    JCLCoin.setProvider(web3.currentProvider) 
    Factory.setProvider(web3.currentProvider)
    Create.setProvider(web3.currentProvider)
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshBalance()
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  refreshBalance: function () {
    const self = this

    let meta
    let meta2

    JCLCoin.deployed().then(function (instance) {
      meta = instance
      return meta.balanceOf(account, { from: account })
      //return meta.getBalance.call(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
    
    JCLCoin.deployed().then(function (instance) {
	meta2 = instance
        return meta2.balanceOf(account, { from: account })
    }).then(function (value) {
      const balanceClient = document.getElementById('balanceClientToken')
      balanceClient.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })

  },

  registerBill: function () {
    const self = this

    JCLCoin.setProvider(web3.currentProvider)
    JCLCoin.web3.eth.defaultAccount=web3.eth.accounts[0]    
    //web3.personal.unlockAccount(web3.eth.defaultAccount)
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount=web3.eth.accounts[0]
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=web3.eth.accounts[0]

    const amount = parseInt(document.getElementById('amount_fact').value)
    const id = parseInt(document.getElementById('id_fact').value)
    const receiver = document.getElementById('debtor').value

    console.log(receiver)
    console.log(typeof(receiver))

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    let fact

    Factory.deployed().then(function (instance) {
        fact = instance
        console.log(fact)
        fact.createBillContract(id, receiver, amount);
    }).catch(function (e) {
        console.log(e)
    })

  },

  payBill: function () {
    const self = this

    JCLCoin.setProvider(web3.currentProvider)
    JCLCoin.web3.eth.defaultAccount=web3.eth.accounts[0]
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount=web3.eth.accounts[0]
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=web3.eth.accounts[0]

    const amountPago = parseInt(document.getElementById('amount_pago').value)
    const idPago = parseInt(document.getElementById('id_pago').value)
    const amountETH = document.getElementById('amount_pagoETH').value


    this.setStatus('Initiating transaction... (please wait)')

    let create
    let factory    

    Factory.deployed().then(function (instance) {
    	factory = instance
    	console.log(instance)
        console.log(factory.idToOwner(idPago))
        factory.idToOwner(idPago).then(function (address) {
		create = address
                console.log(Create.at(create))
		Create.at(create).payingWithToken(account, amountPago, {from: account, value: web3.toWei(amountETH, "ether")})
	})
    })    
  }

}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})

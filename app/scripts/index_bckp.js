// Se importa la página de estilos
import '../styles/app.css'

// Librerías
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Artefactos usados en la abstraccion
import CustFactoryArtifact from '../../build/contracts/CustFactory.json'
import TokenArtifact from '../../build/contracts/Tokens.json' 
//import TokenArtifact from '../../build/contracts/CustToken.json' 
import DAOArtifact from '../../build/contracts/DAO.json'
import CreateArtifact from '../../build/contracts/createPays.json'
import IncentivesArtifact from '../../build/contracts/Incentives.json'

const Token = TruffleContract(TokenArtifact)
const Factory = TruffleContract(CustFactoryArtifact)
const Create = TruffleContract(CreateArtifact)
const DAO = TruffleContract(DAOArtifact)
const Incentives = TruffleContract (IncentivesArtifact)

let Token_address = "0x93044772110864bc0d134ce0e7c174101d5fd10c"
let Factory_address = "0x75e62fb7bd1ccac5f4ae6bf10ae52b5a0d856360"
let DAO_address = "0xbe9d393b23098aaef0f2a975bd3262b44ddfd923"
let Incentives_address = "0xa906c0c8f8e7cdbb49523847b5bee77d057814a8"

let accounts
let account
let receiverCoin
let CreateAdd
let idProp_aut
let eventBill

const App = {
  start: function () {
    const self = this

    // Bootstrap de todas las instancias para su uso. Se hace en todos los métodos.
    Token.setProvider(web3.currentProvider) 
    Factory.setProvider(web3.currentProvider)
    Create.setProvider(web3.currentProvider)
    //alert("�Bienvenido! Comenzaremos guiando en el uso de la aplicación")
    //alert("Comencemos...Aunque la interfaz sea poco amigable, ver�s dos partes bien diferenciadas. La parte del proveedor y la parte del cliente. Para comenzar es necesario que revises si tienes activa en MetaMask la misma cuenta con la que has depslegado los contratos, esta es la cuenta Owner del Factory Contract que crea las facturas.")
    //alert("Ahora, por favor, introduce un valor de factura (en Wei), dale un id numérco a la misma y cargala a una cuenta")
    // Balance inicial de cuenta

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
      idProp_aut = 1
      var address = document.getElementById("account");
      address.innerHTML = account;
      self.refreshBalance()
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  setStatusClient: function (message) {
    const statusClient = document.getElementById('status')
    statusClient.innerHTML = message
  },

  refreshBalance: function () {
   setInterval(function() {

    const self = this

    let meta
    let meta2

    var account = web3.eth.accounts[0]

    //Se fuerza refresco continuo para evitar errores en pantalla.
    var accountInterval = setInterval(function () {
	if (web3.eth.accounts[0] !== account) {
            account = web3.eth.accounts[0];
            var address = document.getElementById("account");
            address.innerHTML = account;
            self.start();
            self.setStatus();
        }
    }, 500)

    // Se fuerza refresco de balance continuo en área proveedor
    //Token.deployed().then(function (instance) {
    Token.at(Token_address).then(function (instance) {
      meta = instance
	return meta.balanceOf(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
    
    // Se fuerza refresco de balance continuo en área cliente
   }, 500)
  },

  registerBill: function () {
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"    
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"

    const amount = parseInt(document.getElementById('amount_fact').value);
    const id = parseInt(document.getElementById('id_fact').value);
    const receiver = document.getElementById('debtor').value.toLowerCase();
    const time_extra = document.getElementById('when');
    const time_extra_value = time_extra.options[time_extra.selectedIndex].value;

    console.log(receiver)
    console.log(typeof(receiver))

    this.setStatus('Initiating transaction... (please wait)')

    let meta
    let fact
    let eventUser
    receiverCoin = account
  
    Token.at(Token_address).then(function (instance) {
      meta = instance.address
    })
    
    Factory.at(Factory_address).then(function (instance) {
	fact = instance
        eventBill = fact.billCreationStatus()
        eventUser = fact.eventUser()
        eventBill.watch(function(err, res) {
          if (!err){
            //console.log(res.args.client);
            alert("Se ha creado el requerimiento de cobro con id: "+res.args.id+" para el cliente con dirección: "+res.args.client)
          }
        })
        eventUser.watch(function(err, res) {
          if (!err){
            //console.log(res.args.client);
            alert("El estado del usuario "+res.args.user+" en el sistema es "+res.args.status)
          }
        })
	console.log(receiver)
	fact.createPayContract(id, receiver, amount, time_extra_value, meta).catch(function (err) {
            console.log(err);
	    alert ("Usted no puede realizar esta acción.No es el Owner del contrato por lo que no puede dar de alta requerimientos de pago. Por favor, rechace la transaccion y pague, moroso.")
	})
    }).catch(function (e) {
        console.log(e)
    })

  },

  payBill: function () {
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount=web3.eth.accounts[0]
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
    let token
    let balance

    Token.at(Token_address).then(function (instance) {
        return instance.balanceOf(account, { from: account })
    }).then(function (value) {
    	balance = value
    })

    Factory.at(Factory_address).then(function (instance) {
    	factory = instance
    	console.log(instance)
        console.log(factory.idToOwner(idPago))
        factory.idToOwner(idPago).then(function (address) {
		create = address
		CreateAdd = address
		var amountWei = web3.fromWei(amountETH, "ether")
		console.log(amountETH)
		if (amountETH >= 0 && balance >= amountPago) {
		  Token.at(Token_address).then(function (instance) {
                	token = instance
                  console.log("La direcci�n de control es: "+CreateAdd)
                  console.log("La cantidad que se quiere pagar es:"+amountPago)
                	token.transfer(CreateAdd, amountPago).catch(function (e) {
                                console.log(e)
                                self.setStatusClient('Error al procesar la transacción.Probablemente se deba a falta de fondos, por favor, revise sus fondos en su Wallet y revise el log.')
                  }).then(function(){
                  console.log("Account: "+account)
		  Create.at(create).payingWithToken(account, amountPago, {from: account, value: amountETH}).then(function(){
                        Create.at(create).ownerBill(account).then(function(data){
                                let dataCoin = data
                                let pendiente = dataCoin[1].toString()
                                self.setStatusClient("Transaccion realizada correctamente.Queda pendiente por pagar "+pendiente+" Weis de la factura con ID: "+idPago)
                                alert("Transaccion realizada correctamente.Queda pendiente por pagar "+pendiente+" Weis de la factura con ID: "+idPago)
                        })
                  }).catch(function (e) {
                                console.log(e)
                                self.setStatusClient('Error al procesar la transacción.Probablemente se deba a falta de fondos, por favor, revise sus fondos en su Wallet y revise el log.')
                  })
                  })
        	  }).then(function () {
                	self.refreshBalance()
        	  })
		} else {alert("No tienes suficientes fondos")}
	})
    })    
  },

  getdir: function () {
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"

    const addressToken = document.getElementById('JCLadd').value
    const idPago = parseInt(document.getElementById('id_pago2').value)

    console.log("La direccion de JCLToken es: "+addressToken)

    this.setStatus('Actualizando direcci�n... (please wait)')

    let create
    let factory

    Factory.at(Factory_address).then(function (instance) {
      factory = instance
      factory.idToOwner(idPago).then(function (address) {
      	create = address
	console.log(address)
	console.log(typeof(addressToken))
	Create.at(create).setJCLTokenContractAddress(addressToken)
	})
    })
  },

  setProp: function (){
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount=web3.eth.accounts[0]
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount=web3.eth.accounts[0]
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=web3.eth.accounts[0]
    DAO.setProvider(web3.currentProvider)
    
    let idFact = parseInt(document.getElementById('id_pago2').value)
    let add_cli = document.getElementById('addressClient').value
    let idPropose = parseInt(document.getElementById('idprop').value)
    let description = document.getElementById('description_blacklist').value

    console.log ("Id de factura"+idFact)
    console.log ("address cliente"+add_cli)
    console.log ("Id Propuesta"+idPropose)
    console.log ("description"+description)

    let create
    let factory

    Factory.at(Factory_address).then(function (instance) {
      factory = instance
      factory.idToOwner(idFact).then(function (address) {
        create = address
        console.log(create)
        DAO.at(DAO_address).then(function(instance){
          let dao = instance
          console.log(dao)
          //dao.setInterfaceChackAmount(create)
          instance.setInterfaceChackAmount(create).then(function(){
            console.log("Hola")
            console.log("Auto"+idProp_aut)
            idProp_aut++
            console.log("Auto"+idProp_aut)
            console.log("dao.proposal("+idProp_aut + add_cli + idFact + description)
            dao.newProposal(idProp_aut, add_cli, idFact, description)
          })
        })
      })
    })
  },

  setIncentives: function (){
    const self = this

    Incentives.setProvider(web3.currentProvider)
    
    let Points = parseInt(document.getElementById('increasePoints').value)

    console.log ("Id de factura"+Points)
    
    let incentive

    Incentives.at(Incentives_address).then(function (instance) {
      incentive = instance
      incentive.increasePointsToAdd(Points).then(function () {
        console.log ("Puntos incrementados correctamente")
      })
    })
  },
  
  voting: function (){
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    DAO.setProvider(web3.currentProvider)
    DAO.web3.eth.defaultAccount=account
    
    let idPropose = parseInt(document.getElementById('idpropvote').value)
    let vote = document.getElementById('vote').value
    let boolValue = vote.toLowerCase() == 'true' ? true : false;
    let justification = document.getElementById('justification').value

    console.log ("Id Propuesta"+idPropose)
    console.log ("Voto"+vote)
    console.log ("description"+justification)

    let create
    let factory

    DAO.at(DAO_address).then(function(instance){
      let dao = instance
      //console.log(msg.sender)
      dao.voting(idPropose, boolValue, justification)
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

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
import AltaMerchantArtifact from '../../build/contracts/Merchant.json'
import AltaUserArtifact from '../../build/contracts/Usuarios.json'

const Token = TruffleContract(TokenArtifact)
const Factory = TruffleContract(CustFactoryArtifact)
const Create = TruffleContract(CreateArtifact)
const DAO = TruffleContract(DAOArtifact)
const Incentives = TruffleContract (IncentivesArtifact)
const Merchant = contract(AltaMerchantArtifact)
const Usuarios = contract(AltaUserArtifact)

let Token_address = "0x78334246c7025c5ee335196b6018b764a238f4ab"
let Factory_address = "0xe92f08483f47e71e2bab3cb3e44d3ab32fb13ea6"
let DAO_address = "0x68ab9d3666a2d1fa128aabefa3c7947c323f8911"
let Incentives_address = "0x49ee1e125fc6a055951f5e6953250eb3dc0d1116"
let Usuarios_address = "0x2e13062391a3f4cc38ff2a9b0e07aeda9db254c1"
let Merchant_address = "0x871d4a5a8f340c8e824e525a04518958133a33e4"

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

  refreshStatusVoting: function () {
   setInterval(function() {

    const self = this

    let idPropose = parseInt(document.getElementById('idpropvote').value)

    let meta
    let meta2

    var account = web3.eth.accounts[0]

    // Se fuerza refresco de balance continuo en área proveedor
    //Token.deployed().then(function (instance) {
    DAO.at(DAO_address).then(function (instance) {
      meta = instance
        return meta.idToProposal(idPropose)
    }).then(function (value) {
      const votingElement = document.getElementById('numb_votes')
      const timeElement = document.getElementById('time_to')
      const executionElement = document.getElementById('execute_to')
      var time_ends = value[5].valueOf()
      var timeUTC = new Date(time_ends*1000)
      var endTime = timeUTC.toLocaleString()
      timeElement.innerHTML = endTime
      votingElement.innerHTML = value[8].valueOf()
      executionElement.innerHTML = value[6]
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })

    // Se fuerza refresco de balance continuo en área cliente
   }, 500)
  },

  setCoin: function () {
    const self = this
    const supply = parseInt(document.getElementById('supply').value)
    const name = document.getElementById('name').value
    const symbol = document.getElementById('symbol').value
    let token
    Token.at(Token_address).then(function (instance) {
      token = instance
      return token.setToken(supply, name, symbol, { from: account })
    }).then(function () {
      alert('Setting complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error setting coin; see log.')
    })

  },

  sendCoin: function () {
    const self = this
    const amount = parseInt(document.getElementById('amount').value)
    const receiver = document.getElementById('receiver').value
    let token
    Token.at(Token_address).then(function (instance) {
      token = instance
      return token.transfer(receiver, amount, { from: account })
    }).then(function () {
      alert('Transaction complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      alert('Error sending coin; see log.')
    })

  },

  burnCoin: function () {
    const self = this
    const amount = parseInt(document.getElementById('amountB').value)
    let token
    Token.at(Token_address).then(function (instance) {
      token = instance
      return token.burn(amount, { from: account })
    }).then(function () {
      alert('Burn complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      alert('Error burning coin; see log.')
    })

  },

  mintCoin: function () {
    const self = this
    const amount = parseInt(document.getElementById('amountM').value)
    let token
    Token.at(Token_address).then(function (instance) {
      token = instance
      return token.mint(amount, { from: account })
    }).then(function () {
      alert('Mint complete!')
      self.refreshBalance()
    }).catch(function (e) {
      console.log(e)
      alert('Error minting coin; see log.')
    })

  },

//------------------------------------ALBERTO------------------------------------------
  
  sendMerchant: function () {
    const self = this

    Merchant.setProvider(web3.currentProvider)
    Merchant.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"

    const direccion = document.getElementById('addcli').value

    console.log("0   "+direccion)
    this.setStatus('Iniciando la transacción... (espere)')

    let meta
    console.log (Merchant)
    Merchant.at(Merchant_address).then(function (instance) {
      meta = instance
      console.log(direccion)
      console.log(meta)
      return meta.createMerchant(direccion)
    }).then(function () {
      self.setStatus('¡Usuario creado con éxito!')
      alert('El usuario se ha creado con éxito. ¡Enhorabuena!')
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error en el alta de usuario. Revise los logs.')
      alert('El alta ha fallado. ¿Estás seguro de que eres el owner?. El problema puede venir de ahí.')
    })
  },

  dropMerchant: function () {
    const self = this

    Merchant.setProvider(web3.currentProvider)
    Merchant.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"

    const direccion = document.getElementById('addcli').value

    console.log("0   "+direccion)
    this.setStatus('Iniciando la transacción... (espere)')

    let meta
    console.log (Merchant)
    Merchant.at(Merchant_address).then(function (instance)  {
      meta = instance
      console.log(direccion)
      console.log(meta)
      return meta.removeInfo(direccion)
    }).then(function () {
      self.setStatus('¡Usuario eliminado con éxito!')
      alert('El usuario se ha eliminado con éxito. ¡Enhorabuena!')
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error en el borrado de usuario. Revise los logs.')
      alert('El borrado ha fallado. ¿Estás seguro de que eres el owner?. El problema puede venir de ahí.')
    })
  },

  // Llamo a la cadena de bloques desde este código para borrar nuevo usuario.
  editMerchant: function () {
    const self = this

    Merchant.setProvider(web3.currentProvider)
    Merchant.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"

    const direccion = document.getElementById('addcli').value

    console.log("0   "+direccion)
    this.setStatus('Iniciando la transacción... (espere)')

    let meta
    console.log (Merchant)
    Merchant.at(Merchant_address).then(function (instance){
      meta = instance
      console.log(direccion)
      console.log(meta)
      return meta.updateInfo(direccion)
    }).then(function () {
      self.setStatus('¡Información del usuario modificada con éxito!')
      alert('La información del usuario se ha modificado con éxito. ¡Enhorabuena!')
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error en la modificación de la información del usuario. Revise los logs.')
      alert('La modificación de la información ha fallado. ¿Estás seguro de que eres el owner?. El problema puede venir de ahí.')
    })
  },

  sendUser: function () {
    const self = this

    Usuarios.setProvider(web3.currentProvider)
    Usuarios.web3.eth.defaultAccount="0x21Ebf4dEe6f30042081e545f328ff55EEa51024F"

    const direccion = document.getElementById('addcli').value

    console.log("0   "+direccion)
    this.setStatus('Iniciando la transacción... (espere)')

    let user
    console.log (Usuarios)
    Usuarios.at(Usuarios_address).then(function (instance) {
      user = instance
      console.log(direccion)
      return user.createUser(direccion)
    }).then(function () {
      self.setStatus('Usuario creado con éxito!')
      alert('El usuario se ha creado con éxito. ¡Enhorabuena!')
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error en el alta de usuario. Revise los logs.')
      alert('El alta ha fallado. ¿Estás seguro de que eres el owner?. El problema puede venir de ahí.')
    })
  },

  dropUser: function () {
    const self = this

    Usuarios.setProvider(web3.currentProvider)
    Usuarios.web3.eth.defaultAccount="0xf90b8b66610d7272d7d58d24143791dc6df52c4b"

    const direccion = document.getElementById('addcli').value

    console.log("0   "+direccion)
    this.setStatus('Iniciando la transacción... (espere)')

    let user
    console.log (Usuarios)
    Usuarios.at(Usuarios_address).then(function (instance) {
      user = instance
      console.log(direccion)
      console.log(meta)
      return user.removeInfo(direccion)
    }).then(function () {
      self.setStatus('¡Usuario eliminado con éxito!')
      alert('El usuario se ha eliminado con éxito. ¡Enhorabuena!')
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error en el borrado de usuario. Revise los logs.')
      alert('El borrado ha fallado. ¿Estás seguro de que eres el owner?. El problema puede venir de ahí.')
    })
  },

  // Llamo a la cadena de bloques desde este código para borrar nuevo merchant.
  editUser: function () {
    const self = this

    Usuarios.setProvider(web3.currentProvider)
    Usuarios.web3.eth.defaultAccount="0xf90b8b66610d7272d7d58d24143791dc6df52c4b"

    const direccion = document.getElementById('addcli').value

    console.log("0   "+direccion)
    this.setStatus('Iniciando la transacción... (espere)')

    let user
    console.log (Usuarios)
    Usuarios.at(Usuarios_address).then(function (instance) {
      user = instance
      console.log(direccion)
      console.log(meta)
      return user.updateInfo(direccion)
    }).then(function () {
      self.setStatus('¡Información del usuario modificada con éxito!')
      alert('La información del usuario se ha modificado con éxito. ¡Enhorabuena!')
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error en la modificación de la información del usuario. Revise los logs.')
      alert('La modificación de la información ha fallado. ¿Estás seguro de que eres el owner?. El problema puede venir de ahí.')
    })
  },

  

//------------------------FIN: Alberto ----------------------------------------

  registerBill: function () {
    const self = this

    Token.setProvider(web3.currentProvider)
    //Token.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Token.web3.eth.defaultAccount=account
    Factory.setProvider(web3.currentProvider)
    //Factory.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"
    Factory.web3.eth.defaultAccount=account
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=account
    //Create.web3.eth.defaultAccount="0x21ebf4dee6f30042081e545f328ff55eea51024f"

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
	fact.createPayContract(id, receiver, amount, time_extra_value, meta, {from: account}).catch(function (err) {
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
            console.log("Auto"+idPropose)
            console.log("dao.proposal("+idProp_aut + add_cli + idFact + description)
            dao.newProposal(idPropose, add_cli, idFact, description).then(function(){
	    	alert("Se ha dado de alta la nueva solicitud (id: "+idPropose+") para la factura con id: "+idFact+" del cliente: "+add_cli)
	    })
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

    self.refreshStatusVoting()

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
  },

  execute: function (){
    const self = this

    DAO.setProvider(web3.currentProvider)
    DAO.web3.eth.defaultAccount=account

    let idPropose = parseInt(document.getElementById('idPropuesta').value)

    console.log ("Id Propuesta"+idPropose)

    DAO.at(DAO_address).then(function(instance){
      let dao = instance
      //console.log(msg.sender)
      dao.execution(idPropose)
    })
  },

  getdebt: function () {
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount=web3.eth.accounts[0]
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount=web3.eth.accounts[0]
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=web3.eth.accounts[0]

    const idDebt = parseInt(document.getElementById('id_pago2').value)


    this.setStatus('Initiating transaction... (please wait)')

    let create
    let factory

    Factory.at(Factory_address).then(function (instance) {
        factory = instance
        console.log(instance)
        console.log(factory.idToOwner(idDebt))
        factory.idToOwner(idDebt).then(function (address) {
                create = address
                CreateAdd = address
                        Create.at(create).ownerBill(account).then(function(data){
                                let dataCoin = data
                                let pendiente = dataCoin[1].toString()
                                self.setStatusClient("Queda pendiente por pagar "+pendiente+" Weis de la factura con ID: "+idDebt)
                                alert("Queda pendiente por pagar "+pendiente+" Weis de la factura con ID: "+idDebt)
                        })
                  }).then(function () {
                        self.refreshBalance()
                  })
        })
    },
  
    getcli: function () {
    const self = this

    Token.setProvider(web3.currentProvider)
    Token.web3.eth.defaultAccount=web3.eth.accounts[0]
    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount=web3.eth.accounts[0]
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=web3.eth.accounts[0]

    const userBlack = document.getElementById('addressClient').value


    this.setStatus('Initiating transaction... (please wait)')

    let userInfo
    let factory

    Factory.at(Factory_address).then(function (instance) {
        factory = instance
        factory.blacklist(userBlack).then(function (response) {
                userInfo = response
		console.log (userInfo)
		console.log(userInfo[1])
		if (userInfo[1] == 0) {
			alert("El usuario no está registrado en la blacklist")
		} else { alert("El usuario ha sido dado de alta en la blacklist por: "+userInfo[0]+" porque debe la cantidad de : "+userInfo[1]+"Weis")}
         })
      })
    },

    deleteBlack: function () {
    const self = this

    Factory.setProvider(web3.currentProvider)
    Factory.web3.eth.defaultAccount=web3.eth.accounts[0]
    Create.setProvider(web3.currentProvider)
    Create.web3.eth.defaultAccount=web3.eth.accounts[0]

    const userdeleteBlack = document.getElementById('addcli').value
    const iddeleteBlack = parseInt(document.getElementById('idPropuesta').value)

    this.setStatus('Initiating transaction... (please wait)')

    let userInfo
    let factory

    Factory.at(Factory_address).then(function (instance) {
        factory = instance
        console.log(userdeleteBlack+"   "+iddeleteBlack)
	factory.deleteFromBlackList(userdeleteBlack, iddeleteBlack).then(function () {
              alert("El usuario ha sido eliminado de la blacklist")
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

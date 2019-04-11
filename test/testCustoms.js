var CustToken = artifacts.require('./Tokens.sol')
var CustFactory = artifacts.require('./CustFactory.sol')
var CreatePays = artifacts.require('./createPays.sol')
var Usuarios = artifacts.require('./Usuarios.sol')
var Merchant = artifacts.require('./Merchant.sol')

contract ('CustToken', function(accounts){
    it ('el nombre del token debe ser CTKN', function(){
        return CustToken.deployed().then(function(instance){
            return instance.symbol.call()
        }).then(function(balance){
            assert.equal(balance.valueOf(), 'CTKN', 'CTKN Es el símbolo válido')
        })
    })

    it('should put 10000000 Tokens in the first account', function () {
        return CustToken.deployed().then(function (instance) {
          return instance.balanceOf.call(accounts[0])
        }).then(function (balance) {
          assert.equal(balance.valueOf(), 10000000, "10000000 wasn't in the first account")
        })
    })

    it('should be 10000000 Tokens as total supply', function () {
        return CustToken.deployed().then(function (instance) {
          return instance.totalSupply.call()
        }).then(function (balance) {
          assert.equal(balance.valueOf(), 10000000, "10000000 wasn't the total supply")
        })
    })
})

contract ('CustFactory', function(accounts){
    it('Se crea el requerimiento de pago', async() => {
	var tokenAddress;
	await CustToken.deployed().then(function(instanceTok){
	  tokenAddress = instanceTok.address;
	})
	await Usuarios.deployed().then(function(instanceUser){
                instanceUser.createUser(accounts[1]);
	})
	await Merchant.deployed().then(function(instanceMerchant){
		instanceMerchant.createMerchant(accounts[0]);
	})
        return CustFactory.deployed().then(async (instance) => {
            var id = 11;
            var id2 = 12;
            var owner = accounts [0]
            var client = accounts[1];
            var amount = 100000;
            var ahora = new Date() / 1000 | 0;
            var expires = ahora + 15*60;
	    var cuenta;
	    await instance.owner().then(function(resp){cuenta = resp}) 
            await instance.createPayContract(id, client, amount, expires, tokenAddress)
	    return instance.idToOwner(id)
          }).then(function(instanceContract){
            assert.notEqual(instanceContract.valueOf(), 0x0000000000000000000000000000000000000000, 'Se ha creado el contrato correctamente')
          })
    })

    it('Se borra el requerimiento de cobro cuando se satisface la deuda', async() => {
        var tokenAddress;
	var instanceToken;
	await CustToken.deployed().then(function(instanceTok){
            tokenAddress = instanceTok.address;
            instanceToken = instanceTok;
	})
	return CustFactory.deployed().then(async (instance) => {
            var id = 12
            var owner = accounts [0]
            var client = accounts[1]
            var amount = 100000
            var ahora = new Date() / 1000 | 0
            var expires = ahora + 15*60
	    var addressContract;
            await instance.createPayContract(id, client, amount, expires, tokenAddress)
            await instance.idToOwner(id).then(function(address){
	    	CreatePays.at(address).payingWithToken(accounts[1], 0, {from: accounts[1], value: 100000}) 
	    })
	    await instance.idToOwner(id).then(function(address){
		CreatePays.at(address).ownerBill(accounts[1]).then(function (output){
                    assert.equal(output[1], 0, 'Requerimiento eliminado')
                })
            })
        })
      })
})

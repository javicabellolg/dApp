var CustToken = artifacts.require('./CustToken.sol')
var CustFactory = artifacts.require('./CustFactory.sol')
var CreatePays = artifacts.require('./CreatePays.sol')

contract ('CustToken', function(accounts){
    it ('el nombre del token debe ser CTKN', function(){
        return CustToken.deployed().then(function(instance){
            return instance.symbol.call()
        }).then(function(balance){
            assert.equal(balance.valueOf(), 'CTKN', 'CTKN Es el símbolo válido')
        })
    })

    it('should put 1000000000000000000 Tokens in the first account', function () {
        return CustToken.deployed().then(function (instance) {
          return instance.balanceOf.call(accounts[0])
        }).then(function (balance) {
          assert.equal(balance.valueOf(), 1000000000000000000, "1000000000000000000 wasn't in the first account")
        })
    })

    it('should be 1000000000000000000 Tokens as total supply', function () {
        return CustToken.deployed().then(function (instance) {
          return instance.totalSupply.call()
        }).then(function (balance) {
          assert.equal(balance.valueOf(), 1000000000000000000, "1000000000000000000 wasn't the total supply")
        })
    })
})

contract ('CustFactory', function(accounts){
    it('Se crea el requerimiento de pago', async() => {
        return CustFactory.deployed().then(async (instance) => {
            var id = 11;
            var owner = accounts [0]
            var client = accounts[1];
            var amount = 100000;
            var ahora = new Date() / 1000 | 0;
            var expires = ahora + 15*60;
            await instance.createPayContract(id, client, amount, expires)
            return instance.idToOwner(id)
        }).then(function(instanceContract){
            assert.notEqual(instanceContract.valueOf(), 0x0000000000000000000000000000000000000000, 'Se ha creado el contrato correctamente')
        })
    })

    it('Se borra el requerimiento de cobro cuando se satisface la deuda', async() => {
        return CustFactory.deployed().then(async (instance) => {
            var id = 11
            var owner = accounts [0]
            var client = accounts[1]
            var amount = 100000
            var ahora = new Date() / 1000 | 0
            var expires = ahora + 15*60
            await instance.createPayContract(id, client, amount, expires)
            return instance.idToOwner(id)
        }).then(async(instanceContract) => {
            CustToken.deployed().then(function(instanceTok){
                CreatePays.at(instanceContract).setJCLTokenContractAddress(instanceTok).then(function(){
                    CustToken.deployed().transfer(instanceContract, amount).then(function(){
                        CreatePays.at(instanceContract).payingWithToken(accounts[1], {from: accounts[1], value: 0})
                    }) 
                })
            }).then (function(){
                CreatePays.at(instanceContract).ownerBill(accounts[1]).then(function (output){
                    assert.equal(output, amount, 'Esto es una prueba')
                })
            })
        })
    })
})

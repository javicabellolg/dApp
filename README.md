# JCL_TFM
## 1-Contratos Desarrollados

### 1.1-CustToken

**Definición:** Contrato generado heredado de ERC20 para realizar las pruebas con un custom Token en las tareas que se realizarán con los contratos que se desarrollarán mas adelante.

**Funcionalidad:** Contrato básico heredado de ERC20. Pone un Supply de Custom Tokens disponibles para poder hacer pruebas con pagos en el resto de  contratos a desarrollar.

**Ubicación:** …/contracts/

**Despliegue:** Desplegado en la migración de la aplicación.

**Constructor:** Envía un initial Supply a la cuenta del usuario que despliega el contrato, el cual será considerado el Owner y administrador del mismo.

#### *a-Mappings y Structs*

No Aplica

#### *b-Funciones*

No Aplica 

### 1.2-CustFactory

**Definición:** Factory Contract para la creación de contratos de requerimientos de cobro. Hereda de Ownable.sol. Se crea un contrato de gestión de requerimiento de cobro por cada requerimiento de cobro, que es asignado al usuario al que se le requiere el cobro.

**Funcionalidad:** Creación de contratos de gestión de requerimientos de cobros, en los que se indica:

- A quién se le requiere el      cobro.
- Quién es el dueño de la deuda      creada. Es decir, quién es el deudor del requerimiento de cobro.
- Identificación de la factura      a la que está asociada el requerimiento de cobro.
- Cantidad adeudada.
- Momento de la creación del      requerimiento de cobro.
- Tiempo de expiración del      requerimiento de cobro.

Por defecto, se crea un requerimiento de cobro por cada pago, aunque el pago se vaya a realizar en el momento. Para ello, en el Front, debe existir una opción para solicitar pago a final de mes o no, que será la que se pase por parámetro a la función de creación de los contratos. Si no se selecciona pago a final de mes, el tiempo de "gracia" para pagar es de 20 minutos sin incurrir en penalizaciones. En caso de solicitar el pago a final de mes, es el usuario el responsable de realizar el pago, sino se incurrirá en penalizaciones.

Gestiona la escritura en la *blacklist* y permisiona los usuarios que pueden acceder a escritura a ella. Por último, en cada requerimiento de cobro creado, se le da un punto al usuario a modo de programa de puntos.

**Ubicación:** …/contracts/

**Despliegue:** Desplegado en la migración de la aplicación.

**Constructor:** N/A

**Previos:** Antes de la ejecución de cualquier orden, hay que setear la dirección del contrato de Incentivos con la dirección que se haya proporcionado y, además, hay que asegurar que en ese contrato de incentivo se ha dado de alta la dirección del contrato *Custfactory* a poder realizar modificaciones:

```
Incentives.at(<dirección_contrato>).enableUsers(<dirección_contrato_a_habilitar>)
```

#### *a-Mappings y Structs*

***Mapping idToOwner -->*** Clave: uint del id de la factura. Valor: address de la dirección del contrato generado para el requerimiento de cobro.

***Mapping permissions -->*** Clave: address del usuario para conocer si tiene permisos o no para escribir en la *blacklist*. Valor: bool para permisionar o no al usuario. Por defecto, *false*.

***Mapping blacklist -->*** Clave: address del usuario incluido en la blacklist. Valor: struct black que tiene información sobre la cantidad que ha dejado adeudada y quien ha hecho la inscripción en la blacklist.

***Struct black -->*** Dos parámetros *(address notifier, uint amount)* para registrar al usuario que registra en la blacklist y la cantidad que se adeuda.

#### *b-Funciones* 

***createPayContract*** 

*Definición:* Factory Contract que genera los requerimientos de cobro a los clientes. 

*Funcionalidad:* Comprueba si el id propuesto no ha sido anteriormente generado, en tal caso procede a crear el contrato de requerimiento de cobro y el tiempo de pago establecido por el cliente.

*ABI:*

```
CustFactory.at(<dirección contrato>).createPayContract(uint _id, address client, uint _amount, uint _timeExtra)
_id --> ID Factura asociada.
_cliente --> Usuario a quien se le hace el requerimiento de cobro.
_amount --> Cantidad adeudada
_timeExtra --> Cantidad de tiempo extra para pagar. En segundos.
```

*Salida esperada:* Contrato de gestión de cobro generado correctamente. Para comprobarlo se puede consultar el mapping *idToOwner:*

```
CustFactory.at(<dirección contrato>).idToOwner.call(uint _id)
_id --> ID Factura asociada.
 
```

***permissionAdd***

*Definición:* Función para creación de permisos a los usuarios que pueden escribir en la blacklist

*Funcionalidad:* Habilita la escritura en la *blacklist.*

*ABI:*

```
CustFactory.at(<dirección contrato>).permissionAdd(address cliente)
_cliente --> Usuario a quien se le hace el requerimiento de cobro.
```

*Salida esperada:* Se habilitan los permisos al usuario. El mapping para la clave *permission[<address cliente>]* cambia su valor a *true.*

***addToBlackList***

*Definición:* Función que gestiona las peticiones de adición a la blacklist

*Funcionalidad:* Gestionar la petición de añadir a un usuario a blacklist. Realiza comprobación si el usuario que realiza la petición tiene permisos para realizarla y si el usuario que se va a inscribir en la blacklist ha incumplido el plazo fijado. A esta función se le ha querido dar cierta entidad de DAO.

*ABI:*

```
CustFactory.at(<dirección contrato>).addToBlackList(address _client, uint _id)
_client --> Usuario a quien se le hace el requerimiento de cobro.
_id --> ID Factura asociada 
```

***deleteFromBlackList***

*Definición:* Función que permite el borrado de los usuarios de la blacklist

*Funcionalidad:* Gestionar la petición de borrar a un usuario a blacklist. Realiza comprobación si el usuario que realiza la petición tiene permisos para realizarla y si el usuario al que se va a borrar de la blacklist ha satisfecho los pagos adeudados. A esta función se le ha querido dar cierta entidad de DAO.

*ABI:*

```
CustFactory.at(<dirección contrato>).deleteFromBlackList(address _client, uint _id)
_client --> Usuario a quien se le hace el requerimiento de cobro.
_id --> ID Factura asociada 
 
```

***setIncentiveContract***

*Definición:* Función que permite setear la dirección del contrato de incentivos.

*Funcionalidad:* Setear la dirección del contrato de incentivos

*ABI:*

```
CustFactory.at(<dirección_contrato>).setIncentiveContract(<dirección_contrato_incentivo>)
```

*Salida Esperada:* Se setea la dirección del contrato de incentivo y puede darse de alta el requerimiento de cobro. OJO!!! Antes de dar de alta el requerimiento, hay que asegurarse que en el contrato de Incentivos se haya habilitado al contrato *CustFactory* a realizar modificaciones, pues sino, dará un revert.

***bye_bye()***

*Definición:* Función Autokill(). Solo puede invocarla el owner del contrato. 

### 1.3 createPays 

**Definición:**  Se generará un contrato por cada requerimiento de pago, identificando el id de la factura con el cliente al que se le requiere el cobro.

**Funcionalidad:** Contrato de creación de requerimientos de cobro que identifica al usuario con la factura (por id) que debe abonar. Se gestionan desde este contrato los retrasos y los cobros tanto con *customTokens* como con ether. Elimina el mapping que identifica al usuario con la cantidad adeudada, aunque el contrato siga levantado, para que pueda seguir consultándose y se tenga un histórico del usuario. Se habilitan varias funciones para:

- Setear el CustomToken con el      que realizar el abono
- Consultar la cantidad      adeudada.
- Consultar si el usuario ha      pasado el tiempo de pago requerido y puede incluirse en la blacklist.

**Ubicación:** …/contracts/

**Despliegue:** Desplegado en cada requerimiento de cobro generado con CustFactory.sol 

**Constructor:** N/A 

**Previos:** Para efectuar los pagos, el flujo de tokens tiene que ser cliente --> contrato --> comercio. Esto es debido a la propia estructura de la función transfer del token ERC20 realiza la transferencia desde la dirección del msg.sender que es el contrato. Por eso, debe haber un transfer desde el cliente al contrato y de ahí al comercio.

#### *a-Mappings y Structs*

***Mapping ownerBill -->*** Clave: address del usuario al que se le requiere el cobro. Valor: Struct con los datos de la factura.

***Struct Bill -->*** 7 parámetros:

- *uint id*: identificador numérico de      la factura.
- *uint      amount:* cantidad      adeudada, en weis.
-  *address ownerSupply:* usuario que requiere el      cobro (Comercio). Es el usuario que da de alta el requerimiento de cobro.
- *uint      createdBill*:      fecha de creación de la factura en UNIX con timestamp.
- *uint      expiresBIll*:      fecha de expiración de la factura en UNIX con timestamp. Es la fecha a      partir de la cual se generarán penalizaciones.
- *bool      penalized:*      Indica si el usuario ha sido penalizado o no.
- *bool      blacklisted*:  El usuario ha excedido todas las      penalizaciones y el tiempo límite para efectuar el pago. El usuario puede      incluirse en 

#### *b-Funciones, modifiers y constructor*

***constructor***

*Definición:* Constructor del contrato, se ejecuta en el despliegue del mismo.

*Funcionalidad:* Constructor del contrato, se ejecuta en el despliegue del mismo. Asigna owner e inicializa el mapping ownerBill.

*ABI:*

```
N/A
```

*Salida Esperada:* 

Se crea el contrato, asignando al usuario cliente todos los datos relativos con el mismo. Se puede verificar consultando el mapping ownerBill:

```
 
createPays.at(<dirección contrato>).ownerBill(<dirección cliente>)
 
```

***modifier evaluateExpires***

*Definición:* Modificador para la evaluación del estado de la penalización.

*Funcionalidad:* Evaluar el estado de penalización del usuario y habilitar para su inscripción en blacklist.

*ABI:* N/A

*Salida Esperada:* Estado de la penalización en que se encuentra el usuario.

***modifier paying***

*Definición:* Modificador para la realización de transferencia del valor indicado a utilizar de *customTokens*.

*Funcionalidad:* Realizar transferencias con *customTokens,* evaluando previamente si se cuenta con saldo suficiente para ello. Finalmente realiza la disminución de la cantidad correspondiente.

*ABI:* N/A

*Salida Esperada:* Transferencia de *customTokens* a la cuenta de destino y disminución de la cantidad adeudada para la factura. 

***function payingWithToken***

*Definición:* Función de pago a la que se llama desde fuera.

*Funcionalidad:* Realizar el pago en ethers indicado, incrementar el valor de la penalización si fuera preciso y eliminar el mapping generado para indicar que la deuda ha sido satisfecha. Realiza las transferencias y las restas de cantidades adeudadas. Anterior a todo, realiza una comprobación de penalización del usuario y de balance de tokens con los modificadores indicados anteriormente.

*ABI:*

```
createPays.at(<dirección contrato>).payingWithToken(<dirección_usuario>, <cantidad_Tokens>, {from: <dirección_usuario>, value: <cantidad_Weis>})
```

*Salida Esperada:*

```
Se realiza el pago y se disminuye la cantidad adeudada. Si no hay fondos, devuelve un revert. Si la cantidad ya ha sido satisfecha se elimina el adeudo.
 
```

***function supplyerAddress***

*Definición:* Consulta del owner del contrato

*Funcionalidad:* Devolver la dirección del usuario que reclama el adeudo.

*ABI:*

```
createPays.at(<dirección contrato>).supplyerAddress(<dirección_cliente>)
```

*Salida Esperada:*

Dirección del usuario que reclama el adeudo.

***function setJCLTokenContractAddress***

*Definición:* Función para establecer la dirección del Token con el que se realizará el pago.

*Funcionalidad: Setear la dirección del CustomToken con el que se realizará el pago.*

*ABI:*

```
createPays.at(<dirección contrato>).setJCLTokenContractAddress(<dirección_Token>)
```

*Salida Esperada:*

Se setea la dirección del Token y se pueden efectuar pagos con la función *payingWithToken.*

***function checkMaxPenalized***

*Definición:* Función para comprobar si se ha llegado a la máxima penalización por retraso en el pago.

*Funcionalidad:* Función utilizada por la inscripción en la blacklist para confirmar si ha llegado el momento de poder incribir al usuario en la blacklist.

*ABI:*

*N/A*

*Salida Esperada: N/A*

***function checkMaxAmount***

*Definición:* Función para comprobar la cantidad adeudada hasta el momento

*Funcionalidad:* Función utilizada por la inscripción en la blacklist para consultar la cantidad adeudada y adjuntarla a la solicitud de inscripción en la blacklist.

*ABI:*

*N/A*

*Salida Esperada: N/A* 

### 1.4-Incentives

**Definición:**  Gestión de incentivos para los usuarios.  

**Funcionalidad:** Gestionar los incentivos para lo usuarios. Este contrato, con sus funcionalidades, es llamado desde el contrato *CustFactory* al crear el requerimiento de cobro, que es cuando se asigna el incentivo al usuario.

**Ubicación:** …/contracts/

**Despliegue:** Desplegado en la migración del contrato

**Constructor:** N/A

**Previos:** En el contrato *CustFactory* tiene que estar seteado la dirección de este contrado y, además, en este contrato se tiene que tener habilitada la dirección del contrato *CustFactory* para que pueda hacer modificaciones.

 

 

 

## 2-Flujos Funcionales

 

 

## 3-Relación y Orden de los comandos

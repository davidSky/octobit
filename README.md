# Octobit
Small and fast tructured binary message codec for Nodejs.

## Size and performance
```js
// from /example/index.js
var octobit= require('octobit')
var struct= new octobit( require('./example.octo.json') )

// example
var getQuery= {
      requestId: 35
    , requestType: {get: true, ack: true, noProxy: true}
    , timestamp: Date.now()
    , notInStruct: 'xyz' // ignored as not in structure
    , key: new Buffer('108827d4-e7f0-7d0a-6775-c93236ca00a3')
    , value: new Buffer('some value')
}
var buffer= struct.encode(getQuery)
console.log( buffer.length ) // 64
console.log( struct.decode(buffer).toObject() ) // {requestId: 35, requestDat ... }

// smaller example
var pingQuery= {
	requestId: 12345678
	, requestType: {ping: 1, ack: 1, noProxy: 1, noCache: 1}
}
var buf= struct.encode(pingQuery)
console.log( buf.length ) // 6
console.log( struct.decode(buf).toObject() ) // {requestId: 12345678, requestType: { ping: tru ... }

```
2012 Mac Air's single core can encode 300,000 {getQuery} objects per second, and decode the resulted buffers in 0.06 second.


## Structures and data types
There are 3 basic data types: `number`, `buffer` and `octet`. Number is the usual (U)int32 and a double; buffer (byte arrays) is Nodejs Buffer that can be up to 65536 long; and octet is one byte (8 bits), and can hold up to 8 unique flags. __Example structure__ [ key, type[, list] ]:
```js
// from /example/example.octo.json
[
	  ["requestId", "uint"]
	, ["requestType", "octet", ["get", "set", "ping", "noCache", "proxy", "noProxy", "faf", "ack"]]
	, ["responseType", "octet", ["get", "set", "error", "proxied", "cached"]]
	, ["timestamp", "double"]
	, ["key", "buffer"]
	, ["value", "buffer"]
]
```
A single `structure` can contain up to `8 elements`. A structure must be defined once and never modified. Only the octet type can endure changes -- new flags can be appended (up to 8).
> when 8 elements is not enough, pack another structure into the first one as a buffer

## encode/decode
* .encode(obj) is a one step process, it directly returns a Buffer that you can flush down a socket.
* .decode(buffer) on the other hand `only reads` the buffer and creates an `index`; it returns an octo-object that allows to get/set specific keys without converting the buffer into an object. This allows to proxy data between servers without decoding/re-encoding the whole thing.

> if proxying data is not a concern, use .decode().toObject() to get the complete object at once

## Data types
* 1: __`uint`__ 4 bytes, 32-bit unsigned integer, max value: 4,294,967,295
* 2: __`int`__ 4 bytes, 32-bit signed integer, max value: -/+2,147,483,647
* 3: __`double`__ 8 bytes, 64-bit double-precision floating-point, max value: -/+9,007,199,254,740,991
* 4: __`buffer`__ 2 bytes, byte-array (Buffer), max buffer byte length: 65,535
* 5: __`octet`__ 1 byte, 8 bits, max values (flags): 8

> there's is no plain text or `String` support; use `buffer type` instead: .encode( { myKey: __new Buffer__('some text') } )

## The `octet` type
The octet type uses 1 byte (8 bits) to store 8 Boolean flags. Octet's elements __order must not change__. If order is changed octet's flags will get scrumbled. You do however can append elements or set existing elements to undefined. Encoding/decoding example:
```js
var octetOnly= struct.encode({requestType: {get: 1, noCache: 1, noProxy: 1}})
console.log(octetOnly) // <Buffer 02 29>
// <29> is the octet (byte) with 3 bits set to 1
var octObj= struct.decode(octetOnly)
console.log( octObj.get('requestType') ) // { get: true, noCache: true, noProxy: true }
console.log( octObj.unset('requestType', 'get') ) // true
console.log( octObj.get('requestType') ) // { noCache: true, noProxy: true }
console.log( octObj.set('requestType', 'set') ) // true
console.log( octObj.get('requestType') ) // { set: true, noCache: true, noProxy: true }
```
##The format
The format is very simple and can be split into 3 main parts, bits, header and buffers:
```
+-----+--------+----------------...
[bits]|[header]|[buffers        ...]
+-----+--------+----------------...
```
* __bits__ is an 8 bit index that indicates which of the 8 elements are set
* __header__ contains all the integers, octets, and length of buffers, there are no empty spaces and no offsets, the elements order in the structure is used instead
* __buffers__ contains all the buffers clamped up together at the end of the message

> In the above `octet` example, in <i>< Buffer 02 29 ><i> that's 1 byte for message's index to indicate which elements are present ('requestType'), and 1 byte for octet data type to indicate which flags are set ('get', 'noCache' and 'noProxy')

<br>

---

---

# API
## new Octobit(structureArray)
```js
var struct= new octobit(structureArray)
```
### octobit.encode(object)
```js
var buffer= struct.encode({key: value, key2: value2}) // returns buffer
```
### octobit.decode(buffer)
```js
var octObject= struct.decode(buffer) // returns octobject
```

## new Octobject
octo-object is created by the octobit.decode() method:
```js
var octObject= struct.decode(buffer) // returns octobject
```
## octobject.get(key)
```js
octObject.get() // returns array containing all set keys
octObject.get('key') // value
```
## octobject.isSet(key[, value])
```js
octObject.set('requestId') // true
// See TODO
```
## octobject.set(key, value)
```js
octObject.set('requestId', 36) // true
octObject.set('requestType', {noProxy: true}) // true
octObject.set('requestType', 'noProxy') // true
// See TODO
```
## octobject.unset(key[, value])
```js
// unset 'noProxy' flag from 'requestType' octet
octObject.unset('requestType', 'noProxy') // true
// See TODO
```
## octobject.getBuffer()
```js
octoObject.getBuffer() // <Buffer ... >
```
## octobject.toObject()
```js
octoObject.toObject() // returns complete object currently held in the buffer
```


# Installation
```
npm install octobit
```


# TODO
* Octobject.unset(key) // remove a key 
* Octobject.set(key, buffer) // set buffer type
* Octobject.set(newKey, value) // set previously not set key
* Octobject.isSet(key, value) // check if a specific flag is set



'use strict';

var octobit= require('.././index.js')
var structure= require('./test.octo.json')

try{
	new octobit([ ["octet", "octet", '1234567890'.split('')] ])
	console.error('ERROR 9 element octet error')
}catch(e){console.log('OK 9 element octet error')}

var sourceObj= {uint: 1, int: -1, double: 1.1, buffer: new Buffer('hello'), octet: {'value1': 1, 'value8':1}}
var struct= new octobit(structure)
var buf= struct.encode(sourceObj)
console.log( struct.encode( {int:0, uint:0,octet: {'value1': 1, 'value8':1}} ) )

try{
	struct.encode({buffer: new Buffer('')})
	console.error('ERROR empty buffer error')
}catch(e){console.log('OK empty buffer error')}
try{
	struct.encode({buffer: new Buffer('')})
	console.error('ERROR too long buffer error')
}catch(e){console.log('OK too long buffer error')}

try{
	struct.encode()
	console.error('ERROR invalid object error')
}catch(e){console.log('OK invalid object error')}
try{
	struct.decode()
	console.error('ERROR invalid buffer error')
}catch(e){console.log('OK invalid buffer error')}

var obj= struct.decode(buf)

// GET
console.log('\nGET')
console.log('get: 		', obj.get().length===5?'OK':'ERROR', obj.get())
console.log('get: uint  	', obj.get('uint')===1?'OK':'ERROR', obj.get('uint'))
console.log('get: int   	', obj.get('int')===-1?'OK':'ERROR', obj.get('int'))
console.log('get: double 	', obj.get('double')===1.1?'OK':'ERROR', obj.get('double'))
console.log('get: buffer 	', obj.get('buffer').toString()==='hello'?'OK':'ERROR', obj.get('buffer').toString())
console.log('get: octet 	', obj.get('octet').value1 && obj.get('octet').value8 && Object.keys(obj.get('octet')).length===2?'OK':'ERROR', obj.get('octet'))
console.log('get: undefined	', obj.get('undefined')===undefined?'OK':'ERROR', obj.get('undefined'))

console.log('\nSET 			')
try{obj.set('uint', -1)}catch(e){}
console.log('set: uint  	', obj.get('uint')!==-1?'OK':'ERROR', obj.get('uint'))
console.log('set: uint  	', obj.set('uint', 0) && obj.get('uint')===0?'OK':'ERROR', obj.get('uint'))
console.log('set: uint  	', obj.set('uint', 4294967295) && obj.get('uint')===4294967295?'OK':'ERROR', obj.get('uint'))
try{obj.set('int', 4294967295)}catch(e){}
console.log('set: int  	', obj.get('int')!==4294967295?'OK':'ERROR', obj.get('int'))
console.log('set: int  	', obj.set('int', 0) && obj.get('int')===0?'OK':'ERROR', obj.get('int'))
console.log('set: int   	', obj.set('int', -2147483648) && obj.get('int')===-2147483648?'OK':'ERROR', obj.get('int'))
console.log('set: int   	', obj.set('int', 2147483647) && obj.get('int')===2147483647?'OK':'ERROR', obj.get('int'))
console.log('set: double 	', obj.set('double', 9007199254740991) && obj.get('double')===9007199254740991?'OK':'ERROR', obj.get('double'))
console.log('set: double 	', obj.set('double', -9007199254740991) && obj.get('double')===-9007199254740991?'OK':'ERROR', obj.get('double'))
console.log('set: double 	', obj.set('double', 0.0) && obj.get('double')===0.0?'OK':'ERROR', obj.get('double'))
console.log('set: double 	', obj.set('double', 0.9007199254740992) && obj.get('double')===0.9007199254740992?'OK':'ERROR', obj.get('double'))
obj.set('buffer', 'hi')// not implemented
console.log('set: buffer 	', obj.get('buffer').toString()==='hello'?'OK':'ERROR', obj.get('buffer').toString())
console.log('set: octet      ', obj.set('octet', {value2:1, value7:1}) && obj.get('octet').value2 && obj.get('octet').value7 && Object.keys(obj.get('octet')).length===2?'OK':'ERROR', obj.get('octet'))
console.log('set: octet flag ', obj.set('octet', 'value3') && obj.get('octet').value2 && obj.get('octet').value3 && obj.get('octet').value7 && Object.keys(obj.get('octet')).length===3?'OK':'ERROR', obj.get('octet'))
console.log('set: undefined	', obj.set('undefined', 'undefined')===undefined?'OK':'ERROR', obj.set('undefined', 'undefined'))

console.log('\nUNSET')

console.log('unset: octet flag', obj.unset('octet', 'value2') && obj.get('octet').value3 && obj.get('octet').value7 && Object.keys(obj.get('octet')).length===2?'OK':'ERROR', obj.get('octet'))

console.log('\nTO-OBJECT')
console.log('toObject', JSON.stringify(obj.toObject()) )

console.log('\nGET-BUFFER')
console.log('getBuffer', obj.getBuffer())

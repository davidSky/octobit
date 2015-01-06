'use strict';

var octobit= require('.././index.js')
var structure= require('./test.octo.json')
var struct= new octobit(structure)

var num= 1000000

console.log('\n	 BENCH:', num)
console.log('\nEncode from Object to Buffer')

// Octobit
var octoObj= {uint: 1, int: -1, double: 1.1, buffer: new Buffer('hello'), octet: {'value1': true, 'value8':true}}
var buf= struct.encode(octoObj) // warm up
console.time('Octobit.encode')
for(var i= 0; num>i; ++i)
    buf= struct.encode(octoObj)
console.timeEnd('Octobit.encode')

// JSON
var jsonObj= {uint: 1, int: -1, double: 1.1, buffer: 'hello', octet: {'value1': true, 'value8':true}}
var jsonBuf= new Buffer(JSON.stringify(jsonObj)) // warm up
console.time('JSON.stringify')
for(var i= 0; num>i; ++i)
    jsonBuf= new Buffer(JSON.stringify(jsonObj))
console.timeEnd('JSON.stringify')


console.log('\nDecode from Buffer to Object (complete)')

// Octobit
struct.decode(buf) // warm up
console.time('Octobit.decode')
for(var i= 0; num>i; ++i)
    struct.decode(buf).toObject()
console.timeEnd('Octobit.decode')

// JSON
JSON.parse( jsonBuf ) // warm up
console.time('JSON.parse    ')
for(var i= 0; num>i; ++i)
    JSON.parse(jsonBuf.toString())
console.timeEnd('JSON.parse    ')


console.log('\nDecode from Buffer to Index (Octobit only)')

// Octobit
struct.decode(buf) // warm up
console.time('Octobit.decode')
for(var i= 0; num>i; ++i)
    struct.decode(buf)
console.timeEnd('Octobit.decode')


console.log('\nDecode from Buffer to Index (Octobit only) and get 1 key')

// Octobit
struct.decode(buf) // warm up
console.time('Octobit.decode')
for(var i= 0; num>i; ++i)
    struct.decode(buf).get('uint')
console.timeEnd('Octobit.decode')

console.log('\n')

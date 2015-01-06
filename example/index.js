var octobit= require('.././index.js')
var struct= new octobit( require('./example.octo.json') )

// full example
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


// The `octet` type
var octetOnly= struct.encode({requestType: {get: 1, noCache: 1, noProxy: 1}})
console.log(octetOnly) // <Buffer 02 29>
// <0b> is the octet with 3 bits set to 1
console.log( struct.decode(octetOnly).get('requestType') ) // { get: true, noCache: true, noProxy: true }
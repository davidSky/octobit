'use strict';

var dataTypes= require('./types.json')
var OctetEncode= require('./octet.js').encode
var Octobject= require('./octobject.js')

var errorStructSize= new Error('Structure must contain 1 to 8 elements')
var errorOctetType= new Error('Octet type must be an array containing 1 to 8 elements')
var errorUnkownType= new Error('Unknown data type')
var errorBufferLength= new Error('Buffer length must be between 1 and 65535 bytes')
var errorEncodeObject= new Error('Invalid object provided')
var errorDecodeBuffer= new Error('Invalid buffer provided')

function codec(struct)
{
	if( !struct || !struct.length || struct.length>8 )
		throw errorStructSize

	this.length= struct.length

	this.types= new Array(8)
	this.bytes= new Array(8)
	this.keys= new Array(8)
	this.octets= []

	var headerLength= 1
	for(var i= 0; this.length > i; ++i)
	{
		if( undefined===dataTypes[ struct[i][1] ] )
			throw errorUnkownType

		this.types[i]= dataTypes[ struct[i][1] ].id
		this.bytes[i]= dataTypes[ struct[i][1] ].bytes
		this.keys[i]= struct[i][0]
		headerLength+= this.bytes[i]

		if( 5===this.types[i] )
		{
			if( !struct[i][2] || !struct[i][2].length || struct[i][2].length > 8 )
				throw errorOctetType

			this.octets[i]= new Array()
			for(var t= 0, tLen= struct[i][2].length; tLen > t; ++t)
				this.octets[i][t]= struct[i][2][t]
		}
	}

	this.header= new Buffer(headerLength)
	this.buffers= new Array(1)
	return this;
}

codec.prototype.encode= function(obj)
{
	if( undefined===obj )
		throw errorEncodeObject

	var i= 0, value= '', buffersLength= 0, bitsSet= 0, offset= 1
	var buffers= new Array(1)
	// this.buffers.length= 1
	for(; this.length > i; ++i)
	{
		if( undefined===(value= obj[this.keys[i]]) )
			continue
		else if( 1===this.types[i] )
			this.header.writeUInt32LE(value, offset, true)
		else if( 2===this.types[i] )
			this.header.writeInt32LE(value, offset, true)
		else if( 3===this.types[i] )
			this.header.writeDoubleLE(value, offset, true)
		else if( 4===this.types[i] )
		{
			if( !value.length || value.length > 65535 )
				throw errorBufferLength
			this.header.writeUInt16LE(value.length, offset)
			buffersLength+= value.length
			buffers.push(value)
		}
		else if( 5===this.types[i] )
			this.header[offset]= OctetEncode(this.octets[i], value)

		bitsSet|= 1 << i
		offset+= this.bytes[i]
	}

	this.header[0]= bitsSet
	buffers[0]= this.header.slice(0, offset)
	return Buffer.concat(buffers, offset + buffersLength)
}

codec.prototype.decode= function(buffer)
{
	if( !Buffer.isBuffer(buffer) )
		throw errorDecodeBuffer

	var i= 0, headerLength= 1
	var offsets= new Array(this.length), msgKeys= new Array(this.length)
	var msgBuffers= new Array(this.length), buffersLength= 0, bufferLength= 0
	for(; this.length > i; ++i)
	{
		if( 0===(buffer[0] & (1 << i)) )		
			continue;
		else if( 4===this.types[i] )
		{
			bufferLength= buffer.readUInt16LE(headerLength, true)
			msgBuffers[i]= [buffersLength, bufferLength]
			buffersLength+= bufferLength
		}

		msgKeys[i]= this.keys[i]
		offsets[i]= headerLength
		headerLength+= this.bytes[i]
	}

	return new Octobject(headerLength, offsets, msgKeys, msgBuffers, buffer, this)
}


module.exports= codec;
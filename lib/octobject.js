'use strict';

var Octet= require('./octet.js')

function Octobject(headerLength, offsets, keys, buffers, buffer, octo)
{
	this.headerLength= headerLength
	this.offsets= offsets
	this.keys= keys
	this.buffers= buffers
	this.buffer= buffer
	this.octo= octo

	return this
}

Octobject.prototype.get= function(key)
{
	if( undefined===key )
		return this.keys
	var i= this.keys.indexOf(key)
	if( -1===i )
		return
	if( 1===this.octo.types[i] )
		return this.buffer.readUInt32LE(this.offsets[i])
	if( 2===this.octo.types[i] )
		return this.buffer.readInt32LE(this.offsets[i])
	if( 3===this.octo.types[i] )
		return this.buffer.readDoubleLE(this.offsets[i])
	if( 4===this.octo.types[i] )
		return this.buffer.slice(this.headerLength + this.buffers[i][0]
			, this.headerLength + this.buffers[i][0] + this.buffers[i][1])
	if( 5===this.octo.types[i] )
		return Octet.decode(this.octo.octets[i], this.buffer[this.offsets[i]])
}

Octobject.prototype.set= function(key, value)
{
	var i= this.keys.indexOf(key)
	if( -1===i )
	{
		// TODO set new key
		return
	}
	else if( 1===this.octo.types[i] )
		this.buffer.writeUInt32LE(value, this.offsets[i])
	else if( 2===this.octo.types[i] )
		this.buffer.writeInt32LE(value, this.offsets[i])
	else if( 3===this.octo.types[i] )
		this.buffer.writeDoubleLE(value, this.offsets[i])
	if( 4===this.octo.types[i] )
	{
		// TODO set buffer
		return
	}
	else if( 5===this.octo.types[i] )
	{
		if( 'string'===typeof value )
		{
			var index= this.octo.octets[i].indexOf(value)
			if( -1!==index )
				this.buffer[this.offsets[i]]|= 1 << index
			else
				return
		}
		else
			this.buffer[this.offsets[i]]= Octet.encode(this.octo.octets[i], value)
	}

	return true
}

Octobject.prototype.isSet= function(key){
	return undefined!==this.keys[key]
}

Octobject.prototype.unset= function(key, value)
{
	var i= this.keys.indexOf(key)
	if( -1===i )
		return
	else if( 5===this.octo.types[i] )
	{
		if( value )
		{
			var index= this.octo.octets[i].indexOf(value)
			if( -1!==index )
				this.buffer[this.offsets[i]]= this.buffer[this.offsets[i]] &~ (1 << index)
			else
				return
			return true
		}
	}

	// TODO unset keys

	return
}

Octobject.prototype.toObject= function()
{
	var i= 0, len= this.keys.length, obj= {}, value
	for(; len > i; ++i)
		if( undefined!==this.keys[i] )
			obj[this.keys[i]]= this.get(this.keys[i])
	return obj
}

Octobject.prototype.getBuffer= function(){
	return this.buffer
}

Octobject.prototype.destroy= function()
{
	for(var i in this){
		this[i]= null
		delete this[i]
	}
}


module.exports= Octobject
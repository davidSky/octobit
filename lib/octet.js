'use strcit';

function encode(octet, obj)
{
	var len= octet.length, i= 0, bitsSet= 0
	for(; len > i; ++i)
		if( obj[ octet[i] ] )
			bitsSet|= 1 << i
	return bitsSet
}
exports.encode= encode

function decode(octet, bitsSet)
{
	var i= 0, len= octet.length, obj= {}
	for(; len > i; ++i){
		if( bitsSet & (1 << i) )
			obj[octet[i]]= true
	}
	return obj
}
exports.decode= decode
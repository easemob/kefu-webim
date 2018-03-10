module.exports = function(source){
	this.value = source;
	var json = JSON.stringify(source)
	.replace(/\u2028/g, "\\u2028")
	.replace(/\u2029/g, "\\u2029");
	return `module.exports = ${json}`;
};

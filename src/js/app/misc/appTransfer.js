var Transfer = require("@/common/disp/transfer");
var transfer;

module.exports = function(){
	return (transfer = transfer || new Transfer(null, "toHost", true));
};

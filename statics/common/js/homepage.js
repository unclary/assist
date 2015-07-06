"use strict";
define(function(require, module, exports){
	var qrcode = require("arale-qrcode/1.1.0/index");
	var qr = new qrcode({
		text: window.location.origin+"/get-wechat-code.html",
		width: 180,
		height: 180
	});
	//document.body.appendChild(qr);
	$("#JS_canvas").prepend(qr)
	console.log(qr);
});
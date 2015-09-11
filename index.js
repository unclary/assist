var express = require('express');
var app = express();
var fs = require("fs");
var path = require("path");

var shortUrl = {};

function getParam(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

app.set("view engine", "html");
app.set("views", express.static(__dirname+"/views"));

app.use(function(req, res, next){
    for( var i in shortUrl){
        if( parseInt(new Date().getTime()/1000,10) - i >= 1 * 86400 ){
            delete shortUrl[i];
        }
    }
    next();
});

app.get("/shorturl.json", function(req, res){
    var u = getParam(req.url, "url");
    var stamp = parseInt(new Date().getTime()/1000,10);
    if( !!u ){
        shortUrl[ stamp+"" ] = u;
        res.send({
            code: 200,
            data: "/shorturl/"+stamp
        });
    } else {
        res.send({
            code: 1000,
            data: "参数url不能为空"
        });
    }
});

app.get("/shorturl/:uri", function(req, res, next){
    if( !!shortUrl[req.params.uri] ){
        res.redirect(shortUrl[req.params.uri]);
    } else {
        next();
    }
});

app.use('/common', express.static( __dirname + '/statics/common' )); // 读取静态资源
app.use('/moe', express.static( __dirname + '/statics/moe' )); // 读取静态资源
app.use('/', express.static( __dirname + '/views' )); // 读取静态资源


function getUAVersion(u){
    var versions = {         //移动终端浏览器版本信息
    	UA: u,
    	bbs: /bz-bbs-(android|ios)/.test(u), // 播种网内核
    	crazy: /bz-crazy-(android|ios)/.test(u), // 疯狂造人内核
        trident: u.indexOf('Trident') > -1, //IE内核
        presto: u.indexOf('Presto') > -1, //opera内核
        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
        mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
        iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
        iPad: u.indexOf('iPad') > -1, //是否iPad
        webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
    };
    var u_android = '';
    if( versions.android ) {
        u_android = versions.android ? u.match( /\([^)]*;[^)]*\)/ )[0].split('; ') : '';
        u_android = u_android[u_android.length-1].match(/[^B]* /)[0];
        u_android = u_android.substr(0, u_android.length-1);
        if( u.indexOf('MiuiBrowser') > 0 ){ // 为红米做兼容
            u_android = isNaN( Number(u_android) ) ? u_android : 'XiaoMi';
        }
    }
    versions.basicModel = !versions.mobile ? "pc" : versions.iPad ? 'ipad' : versions.iPhone ? 'iphone' : versions.android ? 'android' : 'others';
    // pc/ipad/iphone/android详细型号： 
    versions.model = !versions.mobile ? "pc" : versions.iPad ? 'ipad' : versions.iPhone ? 'iphone' : versions.android ? !!u_android ? u_android : 'android' : 'android';
    //versions.model = !versions.mobile? "pc端" : versions.bbs? "播种网APP" : versions.crazy? "疯狂造人APP" : "WAP端";
    return versions;
}

var server = app.listen(6001, function(){
    console.log("listen to 6001");
	var io = require('socket.io')(server);
	io.on('connection', function(client){ 
		client.on("get", function(xx){
			client.broadcast.emit("get", xx);
	    });
	    client.on("get-wechat-code", function(xx){
            xx.ua = getUAVersion(client.handshake.headers["user-agent"]);
            xx.host = client.handshake.address.replace("::ffff", "");
            client.broadcast.emit("get-wechat-code", xx);
        });
        client.on("callback-result", function(xx){
            xx.ua = getUAVersion(client.handshake.headers["user-agent"]);
            xx.host = client.handshake.address.replace("::ffff", "");
            client.broadcast.emit("callback-result", xx);
        });
	    client.on("web_logger", function(xx){
            client.broadcast.emit("web_logger", {
                content: xx,
                host: client.client.conn.remoteAddress.replace("::ffff:",""),
                ua: getUAVersion(client.handshake.headers["user-agent"])
            });
        });
	    
		client.on("disconnect", function(){
		});
	});
});
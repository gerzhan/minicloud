
/**
 * 南京市电教馆单点登录插件
 */  
var urlencode = require('urlencode');
var parse = require('co-body');
var render = require('./lib/render');
var request = require('co-request');
var md5 = require('MD5');
var xmlParse = require('xml-parser');
exports.sso = function *(){  
	//如果是GET请求，则渲染出html文件
	if(this.method=="GET"){
		this.body = yield render('index'); 
	}
	//如果是POST请求，则表示html文件发送了自动请求
	if(this.method=="POST"){
		var post = yield parse(this);
		var token = post.sso_tokeninfo;
		if(token===""){
			//回调sso登录
			var panUrl = "http://pan.nje.cn/1/plugin/nje/";
			var url = post.sso_signinurl+"?ReturnUrl="+urlencode(panUrl);
			this.redirect(url);
		}else{
			//登录成功获得用户信息
			var url = "http://sso.nje.cn/ssoservice.asmx/IsRealNameByTokenID?TokenID="+token;
			var result = yield request(url); 
			var body = xmlParse(result.body.toString());
			if(body.root.content==="false"){
		    	this.body = "本系统仅支持实名制用户";
		    }else{
		    	//获得登录的用户名
		    	url = "http://sso.nje.cn/ssoservice.asmx/GetUserNameByToken?TokenID="+token;
		    	var result = yield request(url);
		    	body = xmlParse(result.body.toString());
		    	var userName = body.root.content;
		    	//获得登录用户信息
		    	var appCode = 'njjyyp';
        		var key = '41f63310-fae6-4175-9d4b-47976ac27799';
        		var encryptString = md5(appCode+userName+key);
        		url = "http://sso.nje.cn/ssoservice.asmx/GetUserInfoByUserName?AppCode="+appCode+"&UserName="+userName+"&EncryptString="+encryptString;
		    	var result = yield request(url);
		    	body = xmlParse(result.body.toString());
		    	var userInfo = {};
		    	for(var i=0;i<body.root.children.length;i++){
		    		var item = body.root.children[i];
		    		userInfo[item.name] = item.content; 
		    	} 
		    	if(userInfo["UserType"]!='教师'){ 
                    this.body ='本系统仅支持教师用户';
                } 
		    	//把信息写入到数据库中
		    	var MiniUser          = require("../../model/mini-user");
		    	var MiniUserMeta      = require("../../model/mini-user-meta");		    	
		    	var MiniGroup         = require("../../model/mini-group");
		    	var MiniUserGroupRelation = require("../../model/mini-user-group-relation");
		    	var MiniUserDevice = require("../../model/mini-user-device");
		    	//创建用户信息(随机密码)
		    	var user = yield MiniUser.createAndRandomPasswd(userInfo.UserName,userInfo.RealName);
		    	//为该用户生成meta信息 
		    	if(typeof userInfo["RealName"] !="undefined"){
		    		yield MiniUserMeta.create(user.id,"nick",userInfo.RealName);
		    	}
		    	if(typeof userInfo["Email"] !="undefined"){
		    		yield MiniUserMeta.create(user.id,"email",userInfo.Email);
		    	}
		    	if(typeof userInfo["UserType"] !="undefined"){
		    		yield MiniUserMeta.create(user.id,"user_type",userInfo.UserType);
		    	}
		    	//创建部门信息，南京电教馆用户是多级组织模式，这里通过orgCode把各级组织分开
		    	var group = yield MiniGroup.create4Nje(userInfo.Org,userInfo.OrgCode);
		    	//创建部门与用户的关系
		    	yield MiniUserGroupRelation.create(group.id,user.id);
		    	//创建网页版设备
		    	yield MiniUserDevice.createWebDevice(user.id,user.user_name);
		    	//初始化access_token
		    	//初始化cookie
		    	//this.body = yield MiniUser.getByName("admin");
		    	//this.body = userInfo;
		    } 
		}
	} 
};
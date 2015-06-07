'use strict'
var coOrm   = require('co-orm');
var modts   = require('orm-timestamps');
var orm     = require('orm'); 
class DBLoader{
  constructor(host,port,name,passwd,dbName){
    this.host = host;
    this.port = port;
    this.name = name;
    this.passwd = passwd;
    this.dbName = dbName;
  }
  /**
  * 初始化数据库连接
  */
  initDBConnect (cb){
    var self = this;
    coOrm.coConnect("mysql://"+self.name+":"+self.passwd+"@"+self.host+":"+self.port+"/"+self.dbName, function (err, db) { 
    	if(err){
    		cb(err);
    		return;
    	}
    	self.db = db; 
	  	db.use(modts, {
		        createdProperty: 'created_at',
		        modifiedProperty: 'updated_at',
		        expireProperty: false,
		        dbtype: { type: 'date', time: true },
		        now: function() { return new Date(); },
		        persist: true
		});  
	  self.defineUserModel();//定义用户表
    self.defineUserMetaModel();//定义用户扩展属性表
		cb(err,self);
	});
  }
  /**
  * 定义用户表
  */
  defineUserModel(){
    //定义用户表数据结构
  	var userModel = this.db.coDefine("miniyun_users", {
        id:Integer,
  	    user_uuid : String, 
  	    user_name : String,
  	    user_pass : String, 
        user_status : Integer, 
  	    salt : String,
  	    user_name_pinyin:String
  	},{ 
  	     timestamp: true
  	});
  	this.userModel = userModel; 
  } 
  /**
  * 定义用户扩展属性表
  */
  defineUserMetaModel(){
    //定义用户表数据结构
    var usermetaModel = this.db.coDefine("miniyun_user_metas", {
        id:Integer,
        user_id : Integer, 
        meta_key : String,
        meta_value : String        
    },{ 
         timestamp: true
    });
    this.usermetaModel = usermetaModel; 
  }
} 
module.exports = DBLoader;

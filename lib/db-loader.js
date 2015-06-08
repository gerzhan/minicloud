'use strict'
var coOrm   = require('co-orm');
var modts   = require('orm-timestamps');
var orm     = require('orm'); 
class DBLoader{
  constructor(host,port,name,passwd,dbName,tablePrefix){
    this.host = host;
    this.port = port;
    this.name = name;
    this.passwd = passwd;
    this.dbName = dbName;
    this.tablePrefix = tablePrefix||"miniyun_";
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
	  self.defineUserModel();//定义用户表:miniyun_users
    self.defineUserMetaModel();//定义用户扩展属性表:miniyun_user_metas
    self.defineGroupModel();//定义群组/部门表:miniyun_groups
    self.defineGroupRelationModel();//定义群组/部门关系表:miniyun_group_relations
    self.defineUserGroupRelationModel();//定义用户与部门关系表:miniyun_user_group_relations
    self.defineUserDeviceModel();//定义用户设备表:miniyun_user_devices
    self.defineUserDeviceMetaModel();//定义用户设备属性表:miniyun_user_device_metas
    self.defineTokenModel();//定义token表：miniyun_tokens
    self.defineRefreshTokenModel();//定义refresh_token表：miniyun_refresh_token
		cb(err,self);
	});
  }
  /**
  * 定义用户表miniyun_users
  */
  defineUserModel(){ 
  	var userModel = this.db.coDefine("miniyun_users", {
        id:Number,
  	    user_uuid : String, 
  	    user_name : String,
  	    user_pass : String, 
        user_status : Number, 
  	    salt : String,
  	    user_name_pinyin:String
  	},{ 
  	     timestamp: true
  	});
  	this.userModel = userModel; 
  } 
  /**
  * 定义用户扩展属性表 miniyun_user_metas
  */
  defineUserMetaModel(){ 
    var usermetaModel = this.db.coDefine(this.tablePrefix+"user_metas", {
        id:Number,
        user_id : Number, 
        meta_key : String,
        meta_value : String        
    },{ 
         timestamp: true
    });
    this.usermetaModel = usermetaModel; 
  }
  /**
  * 定义群组/部门表 miniyun_groups
  */
  defineGroupModel(){ 
    var groupModel = this.db.coDefine(this.tablePrefix+"groups", {
        id:Number,
        user_id : Number, 
        name : String,
        description : String,
        parent_group_id:Number        
    },{ 
         timestamp: true
    });
    this.groupModel = groupModel; 
  }
  /**
  * 定义群组/部门关系表 miniyun_group_relations
  */
  defineGroupRelationModel(){ 
    var groupRelationModel = this.db.coDefine(this.tablePrefix+"group_relations", {
        id:Number,
        group_id : Number,  
        parent_group_id:Number        
    },{ 
         timestamp: true
    });
    this.groupRelationModel = groupRelationModel; 
  }
  /**
  * 定义用户与部门关系表 miniyun_user_group_relations
  */
  defineUserGroupRelationModel(){ 
    var userGroupRelationModel = this.db.coDefine(this.tablePrefix+"user_group_relations", {
        id:Number,
        group_id : Number,  
        user_id:Number        
    },{ 
         timestamp: true
    });
    this.userGroupRelationModel = userGroupRelationModel; 
  }
  /**
  * 定义用户设备表 miniyun_user_devices
  */
  defineUserDeviceModel(){ 
    var userDeviceModel = this.db.coDefine(this.tablePrefix+"user_devices", {
        id:Number,
        user_device_uuid : String,  
        user_id:Number,
        user_device_type:Number,
        user_device_name:String,
        user_device_info:String        
    },{ 
         timestamp: true
    });
    this.userDeviceModel = userDeviceModel; 
  }
  /**
  * 定义用户设备表 miniyun_user_devices_metas
  */
  defineUserDeviceMetaModel(){ 
    var userMetaDeviceModel = this.db.coDefine(this.tablePrefix+"user_devices_metas", {
        id:Number, 
        user_id:Number,
        device_id:Number, 
        meta_name:String,
        meta_value:String        
    },{ 
         timestamp: true
    });
    this.userMetaDeviceModel = userMetaDeviceModel; 
  }
  /**
  * 定义token表 miniyun_tokens
  */
  defineTokenModel(){ 
    var tokenModel = this.db.coDefine(this.tablePrefix+"tokens", {
        oauth_token:String, 
        client_id:String,
        device_id:Number,
        expires:Number,
        scope:String        
    },{ 
         timestamp: true
    });
    this.tokenModel = tokenModel; 
  }
  /**
  * 定义refresh_token表 miniyun_refresh_token
  */
  defineRefreshTokenModel(){ 
    var refreshTokenModel = this.db.coDefine(this.tablePrefix+"refresh_token", {
        client_id:String, 
        oauth_token:Number,
        refresh_token:String,
        expires:Number      
    },{ 
         timestamp: true
    });
    this.refreshTokenModel = refreshTokenModel; 
  }
} 
module.exports = DBLoader;

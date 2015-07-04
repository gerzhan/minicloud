var model = module.exports;

//设定哪些client有password权限
//设置哪些client有refresh_token权限
var authorizedClientIds = {
  password: [
    'JsQCsjF3yr7KACyT', //迷你云网页版
    'd6n6Hy8CtSFEVqNh', //PC客户端
    'c9Sxzc47pnmavzfy', //Mac PC客户端
    'MsUEu69sHtcDDeCp', //Android客户端
    'V8G9svK8VDzezLum', //Linux PC客户端
    'Lt7hPcA6nuX38FY4', //iPad客户端
  ],
  refresh_token: [
    'JsQCsjF3yr7KACyT', //迷你云网页版
    'd6n6Hy8CtSFEVqNh', //PC客户端
    'c9Sxzc47pnmavzfy', //Mac PC客户端
    'MsUEu69sHtcDDeCp', //Android客户端
    'V8G9svK8VDzezLum', //Linux PC客户端
    'Lt7hPcA6nuX38FY4', //iPad客户端
  ]
}


var MiniUtil = require("../../../mini-util")
var dbConn = dbPool.db
var md5 = require('MD5')
  /**
   * 获得访问令牌
   */
model.getAccessToken = function(bearerToken, callback) {
  dbConn.driver.execQuery('SELECT access_token, client_id, expires, user_id FROM oauth_access_tokens ' +
    'WHERE access_token = ?', [bearerToken],
    function(err, result) {
      if (result.length > 0) {
        var token = result[0]
        return callback(false, {
          accessToken: token.access_token,
          clientId: token.client_id,
          expires: new Date(token.expires),
          userId: token.user_id
        });
      }
      callback(false, false);
    });

};
/**
 * 获得refresh令牌
 */
model.getRefreshToken = function(bearerToken, callback) {
  dbConn.driver.execQuery('SELECT refresh_token, client_id, expires, user_id FROM oauth_refresh_tokens ' +
    'WHERE refresh_token = ?', [bearerToken],
    function(err, result) {
      if (result.length > 0) {
        var token = result[0]
        return callback(false, token);
      }
      callback(false, false);
    });
};
/*
 * 查询miniyun_clients核实client_id与client_secret是否正确
 * callback是oauth-server回调的函数
 */
model.getClient = function(clientId, clientSecret, callback) {
  dbConn.driver.execQuery('SELECT * FROM miniyun_clients WHERE client_id = ? and client_secret=? and enabled=1', [clientId, clientSecret], function(err, result) {
    if (result.length > 0) {
      var client = result[0]
      return callback(false, client);
    }
    callback(false, false);
  });
};
/*
 * 判断当前clientId是否有grantType的权限
 * callback是oauth-server回调的函数
 */
model.grantTypeAllowed = function(clientId, grantType, callback) {
  callback(false, authorizedClientIds[grantType] &&
    authorizedClientIds[grantType].indexOf(clientId) >= 0);
};
/*
 * 保存令牌到数据库
 * callback是oauth-server回调的函数
 */
model.saveAccessToken = function(accessToken, clientId, expires, user, callback) {
  dbConn.driver.execQuery('INSERT INTO oauth_access_tokens(access_token,client_id,user_id,expires,created_at,updated_at) value(?,?,?,?,now(),now())', [accessToken, clientId, user.id, expires.getTime()], function(err, result) {
    callback(false);
  });

};
/*
 * 保存refresh令牌到数据库
 * callback是oauth-server回调的函数
 */
model.saveRefreshToken = function(refreshToken, clientId, expires, user, callback) {
  dbConn.driver.execQuery('INSERT INTO oauth_refresh_tokens(refresh_token,client_id,user_id,expires,created_at,updated_at) value(?,?,?,?,now(),now())', [refreshToken, clientId, user.id, expires.getTime()], function(err, result) {
    callback(false);
  });
};

/*
 * 查询用户表并核实密码是否正确
 * callback是oauth-server回调的函数
 */
model.getUser = function(username, password, bodyContext, callback) {
  dbConn.driver.execQuery('SELECT * FROM miniyun_users WHERE user_name = ? and user_status=1', [username], function(err, result) {
    if (result.length == 0) {
      return callback(false, false)
    }
    var user = result[0]
    var salt = user.salt
    var ciphertext = MiniUtil.encryptionPasswd(password, salt)
    if (user.user_pass != ciphertext) {
      return callback(false, false)
    }
    if (user.user_pass == ciphertext) {
      var deviceType = 1
      if (bodyContext.app_key == "d6n6Hy8CtSFEVqNh") {
        deviceType = 2
      }
      if (bodyContext.app_key == "c9Sxzc47pnmavzfy") {
        deviceType = 3
      }
      if (bodyContext.app_key == "MsUEu69sHtcDDeCp") {
        deviceType = 4
      }
      if (bodyContext.app_key == "V8G9svK8VDzezLum") {
        deviceType = 5
      }
      if (bodyContext.app_key == "Lt7hPcA6nuX38FY4") {
        deviceType = 6
      }
      //设备名称
      var deviceName = bodyContext.device_name
        //设备信息
      var deivceInfo = bodyContext.app_key + "_" + username + "_" + deviceName
        //设备的UUID是根据deviceInfo生成
      var deviceUuid = md5(deivceInfo)
      dbConn.driver.execQuery('SELECT * FROM miniyun_user_devices WHERE user_device_uuid = ?', [deviceUuid], function(err, result) {
        if (result.length == 0) {
          //新建记录
          dbConn.driver.execQuery('INSERT INTO miniyun_user_devices(user_device_uuid,user_id,user_device_type,user_device_name,user_device_info,created_at,updated_at) values(?,?,?,?,?,now(),now())', [deviceUuid, user.id, deviceType, deviceName, deivceInfo], function(err, result) {
            return callback(false, user)
          })
        } else {
          //更新记录
          dbConn.driver.execQuery('UPDATE miniyun_user_devices set updated_at=now() where user_device_uuid=?', [deviceUuid], function(err, result) {
            return callback(false, user)
          })
        }
      })
    }
  })
}
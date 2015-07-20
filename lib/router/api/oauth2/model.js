/**
 * Module dependencies.
 */
var model = module.exports
var helper = require("../../../helper")
var co = require('co')
var modelAccessToken = require("../../../model/oauth-access-token")
var modelRefreshToken = require("../../../model/oauth-refresh-token")
var modelApp = require("../../../model/app")
var modelUser = require("../../../model/user")
var modelUserMeta = require("../../../model/user-meta")
var modelDevice = require("../../../model/device")

/**
 * koa-oauth-server's function.
 * According bearerToken,return modelAccessToken
 * @param {String} bearerToken
 * @param {Function} callback
 * @api private
 */
model.getAccessToken = function(bearerToken, callback) {

        co.wrap(function*() {
            var token = yield modelAccessToken.getToken(bearerToken)
            if (token) {
                return callback(false, {
                    accessToken: token.access_token,
                    clientId: token.client_id,
                    expires: new Date(token.expires),
                    userId: token.user_id
                })
            } else {
                callback(false, false)
            }
        })()

    }
    /**
     * koa-oauth-server's function.
     * According bearerToken,return modelRefreshToken
     * @param {String} bearerToken
     * @param {Function} callback
     * @api public
     */
model.getRefreshToken = function(bearerToken, callback) {
        co.wrap(function*() {
            var token = yield modelRefreshToken.getRefreshToken(bearerToken)
            if (token) {
                return callback(false, token)
            } else {
                callback(false, false)
            }
        })()
    }
    /**
     * koa-oauth-server's function.
     * According clientId/clientSecret,return client
     * @param {String} clientId
     * @param {String} clientSecret
     * @param {Function} callback
     * @api public
     */
model.getClient = function(clientId, clientSecret, callback) {
        co.wrap(function*() {
            var app = yield modelApp.getApp(clientId, clientSecret)
            if (app) {
                return callback(false, app)
            } else {
                callback(false, false)
            }
        })()
    }
    /**
     * koa-oauth-server's function.
     * According clientId+grantType,Determine whether there is authorization to access
     * @param {String} clientId
     * @param {String} grantType
     * @param {Function} callback
     * @api public
     */
model.grantTypeAllowed = function(clientId, grantType, callback) {
        callback(false, true)
    }
    /**
     * koa-oauth-server's function.
     * save modelAccessToken to db
     * @param {String} accessToken
     * @param {String} clientId
     * @param {Integer} expires
     * @param {Object} user
     * @param {Function} callback
     * @api public
     */
model.saveAccessToken = function(accessToken, clientId, expires, user, callback) {
        co.wrap(function*() {
            yield modelAccessToken.create(user.id, clientId, accessToken, expires.getTime())
            callback(false)
        })()
    }
    /**
     * koa-oauth-server's function.
     * save modelRefreshToken to db
     * @param {String} refreshToken
     * @param {String} clientId
     * @param {Integer} expires
     * @param {Object} user
     * @param {Function} callback
     * @api public
     */
model.saveRefreshToken = function(refreshToken, clientId, expires, user, callback) {
        co.wrap(function*() {
            yield modelRefreshToken.create(user.id, clientId, refreshToken, expires.getTime())
            callback(false)
        })()
    }
    /**
     * koa-oauth-server's function.
     * According username+password,return user model
     * include account authentication, password authentication, password verification number of errors
     * @param {String} username
     * @param {String} password
     * @param {Object} bodyContext 
     * @param {Function} callback
     */
model.getUser = function(username, password, bodyContext, callback) {
    co.wrap(function*() {  
        var user = yield modelUser.getByName(username)  
        if (!user || !user.status) {
            //user not existed or disabled 
            return callback(new Error("user not existed or disabled"), false)
        }
        //To determine whether the user is locked out
        var isLocked = yield modelUserMeta.isLocked(user.id)
        if (isLocked) {
            return callback(new Error("user is locked,enter the wrong password over five times.please try again after 15 minutes"), false)
        }

        var salt = user.salt
        var ciphertext = helper.encryptionPasswd(password, salt) 
        if (user.password != ciphertext) {
            //Record number of errors
            yield modelUserMeta.updatePasswordErrorTimes(user.id)
                //incorrect password
            return callback(new Error("incorrect password"), false)
        }
        //reset password number of errors
        yield modelUserMeta.resetPasswordErrorTimes(user.id) 
            //create user device
        yield modelDevice.create(user, bodyContext.device_name, bodyContext.app_key)
         
        return callback(false, user)
    })()
}

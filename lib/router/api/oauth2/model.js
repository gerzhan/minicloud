/**
 * Module dependencies.
 */
var model = module.exports
var helpers = require('../../../helpers')
var co = require('co')
var MiniAccessToken = require('../../../model/oauth-access-token')
var MiniApp = require('../../../model/app')
var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
var MiniDevice = require('../../../model/device')
var MiniOnlineDevice = require('../../../model/online-device')
var MiniEvent = require('../../../model/event')
    /**
     * koa-oauth-server's function.
     * According bearerToken,return modelAccessToken
     * @param {String} bearerToken
     * @param {Function} callback
     * @api private
     */
model.getAccessToken = function(bearerToken, callback) {

        co.wrap(function*() {
            var token = yield MiniAccessToken.getToken(bearerToken)
            if (token) {
                var device = yield MiniDevice.getById(token.device_id)
                if (device) {
                    yield MiniOnlineDevice.create(device.user_id, device.id, token.client_id)
                    return callback(false, {
                        accessToken: token.access_token,
                        clientId: token.client_id,
                        expires: new Date(token.expires),
                        device: device
                    })
                }
            }
            return callback(false, false)
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
        // co.wrap(function*() {
        //     var token = yield MiniRefreshToken.getRefreshToken(bearerToken)
        //     if (token) {
        //         return callback(false, token)
        //     } else {
        //         callback(false, false)
        //     }
        // })()
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
            var app = yield MiniApp.getApp(clientId, clientSecret)
            if (app) {
                return callback(false, app)
            } else {
                return callback(false, false)
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
     * @param {Object} device
     * @param {Function} callback
     * @api public
     */
model.saveAccessToken = function(accessToken, clientId, expires, device, callback) {
        co.wrap(function*() {
            yield MiniAccessToken.create(device.id, clientId, accessToken, expires.getTime())
            callback(false)
        })()
    }
    /**
     * koa-oauth-server's function.
     * save modelRefreshToken to db
     * @param {String} refreshToken
     * @param {String} clientId
     * @param {Integer} expires
     * @param {Object} device
     * @param {Function} callback
     * @api public
     */
model.saveRefreshToken = function(refreshToken, clientId, expires, device, callback) {
        // co.wrap(function*() {
        //     yield MiniRefreshToken.create(user.id, clientId, refreshToken, expires.getTime())
        //     callback(false)
        // })()
    }
    /**
     * koa-oauth-server's function.
     * According username+password,return user model
     * include account authentication, password authentication, password verification number of errors
     * @param {String} username
     * @param {String} password
     * @param {Object} req 
     * @param {Function} callback
     */
model.getDevice = function(username, password, req, callback) {
    co.wrap(function*() {
        var bodyContext = req.body
        var user = yield MiniUser.getByName(username)
        if (!user || !user.status) {
            //user not existed or disabled 
            return callback(new Error('user not exist or disable.'), false)
        }
        //To determine whether the user is locked out
        var isLocked = yield MiniUserMeta.isLocked(user.id)
        if (isLocked) {
            return callback(new Error('user is locked,enter the wrong password over five times.please try again after 15 minutes.'), false)
        }

        var salt = user.salt
        var ciphertext = helpers.encryptionPasswd(password, salt)
        if (user.password != ciphertext) {
            //Record number of errors
            yield MiniUserMeta.updatePasswordErrorTimes(user.id)
                //incorrect password
            return callback(new Error('incorrect password.'), false)
        }
        //reset password number of errors
        yield MiniUserMeta.resetPasswordErrorTimes(user.id)
            //create user device
        var device = yield MiniDevice.create(user, bodyContext.device_name, bodyContext.client_id)
            //create login event  
        yield MiniEvent.createLoginEvent(user.id, device.id, req.ip)
            //create online device 
        yield MiniOnlineDevice.create(device.user_id, device.id, bodyContext.client_id)
        return callback(false, device)
    })()
}

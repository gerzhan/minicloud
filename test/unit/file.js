var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file.js', function() {
    this.timeout(global.timeout)
    var app = null 
    var MiniFile = null 
    var user = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()
        MiniFile = require('../../lib/model/file')  
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'admin',
                password: 'admin',
                device_name: 'ji1111m-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
            //set access_token 
        accessToken = res.body.access_token
        //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for(var i=0;i<devices.length;i++){
            var item = devices[i]
            if(item.client_id==='JsQCsjF3yr7KACyT'){
                device = item
            }
        }
        return done()
    })
    it(protocol + ' create folder', function*(done) {
        var file5 = yield MiniFile.createFolder(device,'//home//doc////DOCX//201508/测试*:目录//') 
        file5.file_name_pinyin.should.equal('ceshi__mulu|cs__ml')
        var file4 = yield MiniFile.getByPath(user.id,'/home////doc//DOCX/201508/')
        file4.id.should.equal(file5.parent_id)
        file4.name.should.equal('201508')
        var file3 = yield MiniFile.getByPath(user.id,'/home/doc/docx')
        file3.id.should.equal(file4.parent_id)
        file3.name.should.equal('DOCX')
        var file2 = yield MiniFile.getByPath(user.id,'/home/doc')
        file2.id.should.equal(file3.parent_id)
        file2.name.should.equal('doc')
        var file1 = yield MiniFile.getByPath(user.id,'/home')
        file1.id.should.equal(file2.parent_id)
        file1.name.should.equal('home')
        done()
    })
    it(protocol + ' when path same,rename folder', function*(done) {
        var file1 = yield MiniFile.createFolder(device,'//home//doc////DOCX//201508/测试*:目录ABC//') 
        file1.name.should.equal('测试__目录ABC')
        file1 = yield MiniFile.createFolder(device,'//home//doc////DOCX//201508/测试*:目录abc//')
        file1.name.should.equal('测试__目录abc')
        done()
    })  
    it(protocol + ' create Folder Special character', function*(done) {
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//'
        var file5 = yield MiniFile.createFolder(device,filePath) 
        file5.name.should.equal('测__试__目_录')
        var file4 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////DO"CX//201?508/')  
        file4.name.should.equal('201_508')
        var file3 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////DO"CX//')  
        file3.name.should.equal('DO_CX')
        var file2 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////')  
        file2.name.should.equal('d_o_c')
        var file1 = yield MiniFile.getByPath(user.id,'//ho\\me//')  
        file1.name.should.equal('ho_me')
        done()
    }) 
    it(protocol + ' create Folder Special character', function*(done) {
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录1'
        var file5 = yield MiniFile.createFolder(device,filePath) 
        file5.name.should.equal('测__试__目_录1')
        var file4 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////DO"CX//201?508/')  
        file4.name.should.equal('201_508')
        var file3 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////DO"CX//')  
        file3.name.should.equal('DO_CX')
        var file2 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////')  
        file2.name.should.equal('d_o_c')
        var file1 = yield MiniFile.getByPath(user.id,'//ho\\me//')  
        file1.name.should.equal('ho_me')
        done()
    })
    it(protocol + ' create File', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.create('X1234567', 1073741825)
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//测试A.doc'
        var file5 = yield MiniFile.createFile(device,filePath,version,null)
        file5.name.should.equal('测试A.doc')
        file5.version_id.should.equal(version.id)
        file5.size.should.equal(version.size)
        file5.mime.should.equal('application/msword')
        var file4 = yield MiniFile.getByPath(user.id,'//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录')
        file4.id.should.equal(file5.parent_id)
        //asset fileMeta
        var MiniFileMeta = require('../../lib/model/file-meta')
        var revs = yield MiniFileMeta.getRevs(file5.path_lower)
        assert.equal(revs.length, 1)
        assert.equal(revs[0].hash, 'X1234567')
        done()
    }) 
    it(protocol + ' update File name', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.create('X1234567', 1073741825)
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//测试B.doc'
        var file1 = yield MiniFile.createFile(device,filePath,version,null)
        file1.name.should.equal('测试B.doc') 
        filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//测试b.doc'
        var file2 = yield MiniFile.createFile(device,filePath,version,null)
        file2.name.should.equal('测试b.doc') 
        done()
    })    
})
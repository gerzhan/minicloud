var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file.js', function() {
    this.timeout(10000)
    var app = null 
    var MiniFile = null 
    before(function*(done) {
        app = yield context.getApp()
        MiniFile = require('../../lib/model/file')  
        return done()
    })
    it(protocol + ' create folder', function*(done) {
        var file5 = yield MiniFile.createFolder(1,'//home//doc////DOCX//201508/测试目录//') 
        file5.file_name_pinyin.should.equal('ceshimulu|csml')
        var file4 = yield MiniFile.getByPath(1,'/home////doc//DOCX/201508/')
        file4.id.should.equal(file5.parent_id)
        file4.name.should.equal('201508')
        var file3 = yield MiniFile.getByPath(1,'/home/doc/docx')
        file3.id.should.equal(file4.parent_id)
        file3.name.should.equal('DOCX')
        var file2 = yield MiniFile.getByPath(1,'/home/doc')
        file2.id.should.equal(file3.parent_id)
        file2.name.should.equal('doc')
        var file1 = yield MiniFile.getByPath(1,'/home')
        file1.id.should.equal(file2.parent_id)
        file1.name.should.equal('home')
        done()
    })      
})
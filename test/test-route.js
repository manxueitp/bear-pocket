//const { ObjectId } = require('mongoose').Types
const SpendModel = require('../models/spend')
const app = require('../app')
const request = require('supertest')(app)
var should = require('should');

// request
//   .get('/api/get')
//   .expect(200)
//   .end((err,res)=> {
//     res.body.should.be.an.object
//   })

describe('API test', function(){
    it('should get user info when GET/api/get with token', function(done){
        const self = this
        request
          .get('/api/get/:2017-04-19')
          .expect(200)
          .end((err,res)=>{
            res.body.should.be.an.Object(); 
            done(); 
          })
    })
})


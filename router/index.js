const path = require('path')
const fs = require('fs')

const express = require('express')
const mysql = require('mysql')
const multer  = require('multer')
// 1 创建一个路由容器
const router = express.Router()

const upload = multer({dest: 'upload_tmp/'})

function db(sql) {
  return new Promise((resolve, reject) => {
    const pool  = mysql.createPool({
      host     : 'localhost',	//本机
      user     : 'root',		//账号root
      password : 'root',	//密码12345
      database : 'test'	//数据库名
    })
     
    pool.getConnection(function(err, connection) {
      if (err) reject(err) // not connected!
     
      // Use the connection
      connection.query(sql, function (error, ...args) {
        // When done with the connection, release it.
        connection.release();
     
        // Handle error after the release.
        if (error) reject(error)
        
        // Don't use the connection here, it has been returned to the pool.
        resolve(...args)
      })
    })
  })
}
function checkLogin(req, res, next) {
  // console.log(req.session)
  if(!req.session.user) {
    return res.status(500).send({
      message: '未登录'
    })
  }
  next()
}
async function cpmTime(req, res, next) {
  let startTime = new Date()
  await next()
  let endTime = new Date()
  res.header("time", endTime - startTime + 'ms')
}

router
  .get('/user', cpmTime, async (req, res) => {
    try{
        const ret = await db('select * from user')
        res.status(200).send(ret)
    }catch(e){
      //TODO handle the exception
      console.log(e)
    }
  })
  .get('/user/:id', async (req, res) => {
    try{
      const id = req.params.id
      const ret = await db(`select * from user where id='${id}'`)
      res.status(200).send(ret)
    }catch(e){
      //TODO handle the exception
      console.log(e)
    }
  })
  .post('/user', async (req, res) => {
    try{
      const body = req.body
      const {insertId} = await db(`insert into user(username, password, nickname) values('${body.username}', '${body.password}', '${body.nickname}')`)
      const ret = await db(`select * from user where id='${insertId}'`)
      res.status(200).send(ret)
    }catch(e){
      //TODO handle the exception
      console.log(e)
    }
  })
  .post('/user/:id', checkLogin, async (req, res) => {
    try{
      const body = req.body
      const id = req.params.id
      const userId = req.session.user.id
      if(userId !== parseInt(id)) {
        return res.status(500).send({
          message: '无权操作'
        })
      }
      await db(`update user set username='${body.username}', password='${body.password}', nickname='${body.nickname}' where id='${id}'`)
      const ret = await db(`select * from user where id='${id}'`)
      res.status(200).send(ret)
    }catch(e){
      //TODO handle the exception
      console.log(e)
    }
  })
  .delete('/user/:id', async (req, res) => {
    try{
      const id = req.params.id
      await db(`delete from user where id='${id}'`)
      res.status(200).send({})
    }catch(e){
      //TODO handle the exception
      console.log(e)
    }
  })
  .post('/login', async (req, res) => {
    try{
      const {username, password} = req.body
      const [ret] = await db(`select * from user where username='${username}'`)
      // console.log(ret)
      if(!ret || ret.password !== password){
        return res.status(401).send({
          message: '用户名或密码错误'
        })
      }
      // 记录session
      req.session.user = ret
      
      res.status(200).send({
        message: '登录成功',
        data: ret
      })
    }catch(e){
      //TODO handle the exception
      console.log(e)
    }
  })
  .delete('/exit', (req, res) => {
    // 记录session
    delete req.session.user
    res.status(200).send({
      message: '注销成功'
    })
  })
  .post('/upload', upload.any(), (req, res, next) => {
    console.log(req.files[0]);  // 上传的文件信息
    const des_file = "./upload/" + req.files[0].originalname;
    fs.readFile( req.files[0].path,  (err, data) => {
      if(err) {
        return console.log('err1:', err)
      }
      fs.writeFile(des_file, data, (err) => {
        if( err ){
          console.log('err2:', err )
        }else{
          res.status(200).send({
            message:'文件上传成功',
            filename:req.files[0].originalname
          })
        }
      })
    })
  })
  
module.exports = router

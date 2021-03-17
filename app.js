const express = require('express')
const router = require('./router')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*")
//   // 请求头  x-token
//   res.header("Access-Control-Allow-Headers", "*")
//   // 请求方法  post get put delete patch
//   res.header("Access-Control-Allow-Methods", "*")
//   // 下一步
//   next()
// })

app.use(session({
  //配置加密字符串，他会在原有的基础上和字符串拼接起来去加密
  //目的是为了增加安全性，防止客户端恶意伪造
  secret: 'he llo',
  resave: false,
  saveUninitialized: true,//无论是否适用Session，都默认直接分配一把钥匙
  // cookie: { secure: true }
}))


app.use('/public', express.static('./public'))
// 开放静态资源
// 1.当以/upload开头的时候，去./upload/目录中找对应资源
// 访问：http://127.0.0.1:3000/upload/icon.jpg
app.use('/upload', express.static('./upload'))

app.use(router)

app.listen(3002, function() {
	console.log('app is running at port localhost:3002...');
})


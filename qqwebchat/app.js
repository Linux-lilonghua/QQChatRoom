/*
搭建服务器   导入socket.io和express模块
*/

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const QRCode=require('qrcode');
const fs=require('fs')
var Jimp = require("jimp");
var QrCode = require('qrcode-reader');

 /**
  * 连接MongoDB
  */
 var MongoClient = require('mongodb').MongoClient;
 var url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1";

//记录所有已经登录过的用户
var users=[]
//连接数据库
var mysql = require('mysql');
//express处理静态资源，将public目录设置为静态目录
app.use(require('express').static('public'))
//监听3000端口
server.listen(3000,()=>{
    console.log('服务器启动了')
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


 // 历史记录页面------get请求
app.get('/history',async(req, res)=>{
  const myname=req.query.myname
  const toname=req.query.toname
  console.log(myname,toname)
// 使用 Promise连接数据库
MongoClient.connect(url).then((conn) => {
  console.log("数据库已连接");
  const qq = conn.db("qqweb").collection("qqchat");
  // 查询群聊的
  if(toname==='群聊'){
    qq.find({$or:[{"name":'群聊'},{"toname":'群聊'}]}).toArray().then((arr) => {
      console.log(arr);
      res.json({'sucess':true,'chat':arr})
  }).catch((err) => {
  console.log("数据库操作错误");
}).finally(() => {
  conn.close();
});
  }else{  // 查询其他的
 qq.find({$or:[{"name":myname, "toname":toname},{"name":toname, "toname":myname}]}).toArray().then((arr) => {
          console.log(arr);
          res.json({'sucess':true,'chat':arr})
      }).catch((err) => {
      console.log("数据库操作错误");
  }).finally(() => {
      conn.close();
  });
}
}).catch((err) => {
  console.log("数据库连接失败");
});
});


//好友列表---get请求
app.get('/friends',async(req, res)=>{
  const myname=req.query.myname
  console.log(myname)
  connect(myname)
//使用异步函数
async function connect(myname){
  var conn = null;
 try{
  conn = await MongoClient.connect(url);
  console.log("数据库已连接");
  const qq = conn.db("qqweb").collection("qqfriends");
  var arr=await qq.find({"name":myname}).toArray()
  res.json({'sucess':true,'friends':arr})
  }catch (err){
   console.log("错误：" + err.message);
 } finally {
   if (conn != null) conn.close();
 }
 }
});


//添加好友--post请求
app.get('/addfriend',async(req, res)=>{
  const myname=req.query.myname
  const myavatar=req.query.myavatar
  const toname=req.query.friendname
  const toavatar=req.query.friendavatar
  // console.log(myname)
  // console.log(myavatar)
  // console.log(toname)
  // console.log(toavatar)
  var num=1       //标志着好友是否重复
  await add(myname,myavatar,toname,toavatar)
  console.log(num)
  if(num===-1){res.json({'sucess':false})
  }else{
  res.json({'sucess':true})}

//使用异步函数
async function add(myname,myavatar,toname,toavatar){
 var conn = null;
try{
 conn = await MongoClient.connect(url);
 console.log("数据库已连接");
 const qq = conn.db("qqweb").collection("qqfriends");
 arr=await qq.find({$or:[{"name":myname, "toname":toname},{"name":toname, "toname":myname}]}).toArray()
 if(arr.length!=0){num=-1}else{
   //添加自己为好友
  if(myname===toname){
    await qq.insertOne({"name":myname,"toname":toname,"toavatar":toavatar})
   }else{
   //添加好友
   await qq.insertMany([{"name":myname,"toname":toname,"toavatar":toavatar},{"name":toname,"toname":myname,"toavatar":myavatar}])
 }
}}catch (err){
  console.log("错误：" + err.message);
} finally {
  if (conn != null) conn.close();
}
}
})

//删除好友请求--post请求
app.get('/delfriend',async(req, res)=>{
  const myname=req.query.myname
  const myavatar=req.query.myavatar
  const toname=req.query.friendname
  const toavatar=req.query.friendavatar
  // console.log(myname)
  // console.log(myavatar)
  // console.log(toname)
  // console.log(toavatar)
  del(myname,myavatar,toname,toavatar)
  res.json({'sucess':true})
  //使用异步函数
 async function del(myname,myavatar,toname,toavatar){
  var conn = null;
  try{
   conn = await MongoClient.connect(url);
   console.log("数据库已连接");
   const qq = conn.db("qqweb").collection("qqfriends");
  //删除好友
   await qq.deleteOne({"name":myname,"toname":toname,"toavatar":toavatar})
   await qq.deleteOne({"name":toname,"toname":myname,"toavatar":myavatar})
  }catch (err) {
    console.log("错误：" + err.message);
} finally {
    if (conn != null) conn.close();
}
}
 })



/*
主逻辑处理部分
*/
io.on('connection', function (socket) {

//通过mongo查询mysql信息
 async function mm(id){
     //连接数据库
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'test'
    });
    connection.connect(); 
    //查询
   var  sql = 'SELECT * FROM user where id='+id
   connection.query(sql,function (err, result) {
    if(result.length!=0){
      socket.emit('loginSuccess',result[0])
    }
   })
  }

 //扫描二维码事件
  socket.on('scan', (path) => {
    lujing="./public"+path
  var buffer = fs.readFileSync(lujing);
  // console.log(__dirname)//返回当前目录路径的意思
  console.log(buffer)
  Jimp.read(buffer, function(err, image) {
    if (err) {
        console.error(err);
    }
    let qrcode = new QrCode()
    //回调函数
    qrcode.callback = function(err, value) {
        if (err) {
            console.error(err);
        }
        console.log(value.result);
    };
    // qrcode.decode(image.bitmap);
    // console.log('--------')
    console.log(image.bitmap.data)
    // 使用 Promise连接数据库
  MongoClient.connect(url).then((conn) => {
  console.log("数据库已连接");
  const qq = conn.db("qqweb").collection("qqqrcode");
  // qq.insertOne({"id":"002","qrcode":`${image.bitmap.data}`})
   qq.find().toArray().then((arr)=> {
    for(var i=0;i<arr.length;i++){
      console.log("--------")
      console.log(arr[i].qrcode==image.bitmap.data)
      if(arr[i].qrcode==image.bitmap.data){
       mm(arr[i].id);
       break;
      }
    }
    if(i==arr.length)socket.emit('loginFailed')
    })
  .catch((err) => {
    console.log("数据库操作错误");
}).finally(() => {
    conn.close();
});
})
 });
})


  /*
  登录事件的处理
  */
  socket.on('login',data=>{
    console.log(data.userid)
    console.log(data.userpwd)
     //连接数据库
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'test'
    });
    connection.connect(); 
    //查询
   var  sql = 'SELECT * FROM user where id='+data.userid+' and password='+data.userpwd;
   console.log(sql)
   connection.query(sql,function (err, result) {
        if(result.length!=0){
          //查看是否重复登录
        const user=users.find(item => item.id === result[0].id)
        if(user){
        console.log('重复登录!');
        //登录失败
        socket.emit('relogin')
        }else{
        //登录成功
       //将用户放入登录成功用户的数组中
       users.push(result[0])
        //记录当前登录用户的信息
       socket.password=result[0].password
       socket.name=result[0].name
       socket.image=result[0].image
       //触发登录成功事件
       socket.emit('login-Sucees',result[0])
       //告诉所有人有人进来了
       io.emit('adduser',users)
        }
        }else{
          console.log('账号或密码错误!');
          //登录失败
        socket.emit('login-fail')
        }
});
//断开数据库连接
connection.end();
});


/*
用户离开
*/
socket.on('disconnect', () => {
  // 把当前用户的信息从users中删除
  const idx = users.findIndex(item => item.name === socket.name)
  if(idx!=-1)
  users.splice(idx, 1)
  // 告诉所有人，userlist发生更新
  io.emit('adduser', users)
})


  /*
  聊天事件的处理
  */
 //发送消息
 socket.on('sendmessge',data=>{

/**
 * 聊天记录存入mongoDB中
 */
// 使用 Promise连接数据库,不知道为什么正常连接会有问题，这样连接就不会，搞不懂
MongoClient.connect(url).then((conn) => {
  console.log("数据库已连接");
  const qq = conn.db("qqweb").collection("qqchat");
  // 查询
  // var doc = {"name":data.name,"toname":data.toname,"msg":data.msg};
  //  qq.insertOne(doc)
  qq.insertOne({"name":data.name,"toname":data.toname,"msg":data.msg,"index":data.index,"img":data.img,"avatar":data.avatar})
 .catch((err) => {
      console.log("数据库操作错误");
  }).finally(() => {
      conn.close();
  });
}).catch((err) => {
  console.log("数据库连接失败");
});

/**
 * 
 */
  if(data.toname==='群聊'){
    console.log(data)
    //使所有人接受消息
    io.emit('receviemesggemyself',data)
  }else{
    console.log(data.toname)
    var tosocket=null
    //登录的用户都会自动装入io.sockets.sockets
    var SocketConnections=io.sockets.sockets;
    // console.log(SocketConnections)
    SocketConnections.forEach(s=>{
      if(s.name===data.toname && s.name!=data.name){
        tosocket=s.id
      }
    })
    if(tosocket){
      console.log(tosocket)
      //发送给指定的用户
      io.to(tosocket).emit('receviemesggeother',data)
      //发送给自己
      socket.emit('receviemesggemyself',data)
    }else{
      //只发送给自己
      socket.emit('receviemesggemyself',data)
    }

  }
 })
 //发送图片消息
 socket.on('sendImage',data=>{
/**
 * 聊天记录存入mongoDB中
 */
// 使用 Promise连接数据库
MongoClient.connect(url).then((conn) => {
  console.log("数据库已连接");
  const qq = conn.db("qqweb").collection("qqchat");
  // 查询
  // var doc = {"name":data.name,"toname":data.toname,"msg":data.msg};
  //  qq.insertOne(doc)
  qq.insertOne({"name":data.name,"toname":data.toname,"index":data.index,"msg":data.msg,"avatar":data.avatar})
 .catch((err) => {
      console.log("数据库操作错误");
  }).finally(() => {
      conn.close();
  });
}).catch((err) => {
  console.log("数据库连接失败");
});

/**
 * 
 */
  if(data.toname==='群聊'){
    console.log(data)
    //使所有人接受消息
    io.emit('recevieImagemyself',data)
  }else{
    console.log(data.toname)
    var tosocket=null
    //登录的用户都会自动装入io.sockets.sockets
    var SocketConnections=io.sockets.sockets;
    SocketConnections.forEach(s=>{
      if(s.name===data.toname && s.name!=data.name){
        tosocket=s.id
      }
    })
    if(tosocket){
      console.log(tosocket)
      //发送给指定的用户
      io.to(tosocket).emit('recevieImageother',data)
      //发送给自己
      socket.emit('recevieImagemyself',data)
    }else{
      //只发送给自己
      socket.emit('recevieImagemyself',data)
    }

  }
 })

 //添加好友成功
 socket.on('toadd',()=>{
  io.emit('haoyou')
 })

 //删除好友成功
socket.on('todel',()=>{
  io.emit('haoyou')
 })

 //注册事件
 socket.on('zhuche',data=>{
    console.log(data)
    //连接mysql数据库
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'test'
    });
    connection.connect(); 
    //查询
   var  sql = 'INSERT INTO user(id,password,name,image) VALUES(?,?,?,?)';
   var addsql=[data.id,data.pwd,data.name,data.path]
   console.log(sql)
   connection.query(sql,addsql,function (err, result) {
    if(err){
      socket.emit("zhuchefail")
      return;
     }
     const loginUrl='http://example.com/login'
//生成二维码
QRCode.toDataURL(`${loginUrl}?token=${data.name}`,{},(error,url)=>{
  if(error){
    console.error(error)
    return;
  }
  //将二维码作为临时文件 
  const filePath=`./public/images/${data.name}.png`;
  console.log(filePath)
  const fileStream=fs.createWriteStream(filePath);
  const qrCodeData=url.replace(/^data:image\/png;base64,/,"");//去掉data:image/png;base64,
  fileStream.write(Buffer.from(qrCodeData,'base64'));
  fileStream.end()
})
    socket.emit("tozhuchesucess",data) 
   })
 })

// 写入二维码
socket.on("tozhuchesucess",data=>{
  lujing="./public/images/"+data.name+".png"
  var buffer = fs.readFileSync(lujing)
  Jimp.read(buffer, function(err, image) {
    if (err) {
        console.error(err);
        socket.emit("zhuchefail")
    }
    let qrcode = new QrCode()
    //回调函数
    qrcode.callback = function(err, value) {
        if (err) {
            console.error(err);
        }
        console.log(value.result);
    };
    // 使用 Promise连接数据库
  MongoClient.connect(url).then((conn) => {
  console.log("数据库已连接");
  const qq = conn.db("qqweb").collection("qqqrcode");
  qq.insertOne({"id":`${data.id}`,"qrcode":`${image.bitmap.data}`})
  .catch((err) => {
    console.log("数据库操作错误");
}).finally(() => {
    conn.close();
});
})
  })
  socket.emit("zhuchesucess")
});


}) 
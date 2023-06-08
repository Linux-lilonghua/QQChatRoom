/*
客户端
*/
//连接socket.io服务
  var socket = io.connect('http://localhost:3000');
//用户发送的信息
  var myavatar,myname,mymsg,toname='群聊'
  var count//记录多少用户



//点击注册事件
$('.box1 .box-bottom .zhuche').on('click',()=>{
  alert('点击了注册事件')
  $('.box1').hide()
  $('.box4').fadeIn()
})

//点击注册按钮
$('.box4 .box-zhuche #zcbtn').on('click',()=>{
  var data
  var nicai=$('.box4 .box-zhuche #nicai').val().trim()
  var id=$('.box4 .box-zhuche #id').val().trim()
  var pwd=$('.box4 .box-zhuche #pwd').val().trim()
  if(nicai===""){
    alert('昵称不能为空')
  }else if(id===""){
    alert('id不能为空')
  }else if(pwd===""){
    alert('密码不能为空')
  }else{
  path=$('.box4 img').attr('src')
  if(path.indexOf("/images/")!=-1)path=path.replace("/images/","")
  else path=path.replace("images/","")
  console.log(path)
  console.log(nicai)
  console.log(id)
  console.log(pwd)
  //触发QQ注册事件
  socket.emit("zhuche",{path:path,name:nicai,id:id,pwd:pwd})
  }
})

//to注册成功
socket.on('tozhuchesucess',(data)=>{
  setTimeout(function(){ socket.emit('tozhuchesucess',data) }, 1000);
  
})

//注册成功
socket.on('zhuchesucess',(data)=>{
  alert('注册成功了')
  $('.box4 .box-zhuche #nicai').val('')
  $('.box4 .box-zhuche #id').val('')
  $('.box4 .box-zhuche #pwd').val('')
})

//注册失败
socket.on('zhuchefail',()=>{
  alert('注册失败了')
  $('.box4 .box-zhuche #nicai').val('')
  $('.box4 .box-zhuche #id').val('')
  $('.box4 .box-zhuche #pwd').val('')
})

//点击更改头像
$('.box-zhuche #fileawatar').on('change',()=>{
  var fileawatar = document.querySelector('.box4 input[type=file]').files[0];
  // console.log(fileawatar.name)
  path="/images/"+fileawatar.name
  const t=document.querySelector('.box4 img')
  t.src= path
})



//点击了快捷登录功能，二维码功能
$('.box1 .box-bottom .qrcode').on('click',()=>{
  alert('点击了快捷登录事件')
  $('.box1').hide()
  $('.box3').fadeIn()
})
//二维码图片
const qrcode=document.getElementById('qrcode')
//扫描二维码
$('.saomiao').on('click',()=>{
  var path=$('#qrcode').attr('src')
  console.log(path)
  socket.emit('scan',path);
})
//选择二维码
$('#xuze').on('change',()=>{
  var file  = document.querySelector('.box3 input[type=file]').files[0];
  var path="/images/"+file.name
  qrcode.src=path
  console.log(path)
  alert('改变了')
})

//扫描成功
socket.on('loginSuccess',(data)=>{
alert('成功了')
socket.emit('login',{userid:data.id,userpwd:data.password})
})
// 扫描失败
socket.on('loginFailed',()=>{
  alert('失败了')
})


//点击登录按钮
  $('.box-login #btn').on('click',function(){

    var id =$('.box-login #userid').val()
    var password=$('.box-login #userpwd').val()
    if(id==='')alert('账号不能为空')
    else if(password=='')alert('密码不能为空')
    else{
    console.log(id)
    console.log(password)
    //触发登录事件
    socket.emit('login',{userid:id,userpwd:password})
    }
})

//登录成功
socket.on('login-Sucees',(data)=>{
  console.log('登录成功')
  $('.box3').hide()
  $('.box1').hide()
  // 显示聊天窗口
  $('.box2').fadeIn()
  //设置头像和用户名
  myavatar='images/'+data.image//全局变量
  myname=data.name         //全局变量
  $('.myavatar').attr('src',myavatar)
  $('.maininfo').append(`
  <a class="myname">${myname}</a>
  `)
  //设置好友列表
  friends();
})
//好友列表函数
async function friends(){
  const response=await fetch(`/friends?myname=${myname}`)
   if(response.ok)
   {
    const data=await response.json()
    console.log('------------')
    console.log(data.friends)
    console.log('------------')
    $('.friendlist').html('')
    data.friends.forEach(item => {
   $('.friendlist').append(`
    <div class="user"><img src="${item.toavatar}" alt="">
    <a class='othername'>${item.toname}</a>
    </div>
    `)
   })
  }
  }

//登录失败
socket.on('login-fail',()=>{
  alert('账号或密码错误！')
  $('.box-login #userid').val('')
  $('.box-login #userpwd').val('')
})
//登录重复
socket.on('relogin',()=>{
  alert('重复登录!')
  $('.box-login #userid').val('')
  $('.box-login #userpwd').val('')
})


//增加聊天面板
async function liaotian(name){
  console.log('执行了聊天面板')
$('.box2 .liaotian').append(`
<div class=${name} maincomment style="display:none;"></div>
`)
}

/*
监听用户列表
*/
socket.on('adduser',(data)=>{
    //有多少用户(data为一个对象数组)
    count=data.length
    //设置聊天面板
    //清空
  //  $('.liaotian').html('')
  //  //设置群聊面板
  //  $('.box2 .liaotian').append(`
  //  <div class='群聊' maincomment></div>
  //  `)

    //设置用户列表
    //清空
    $('.list').html('')
    //设置群聊
    $('.list').append(`
    <div class="user"><img src="images/avatar.jpg" alt="">
                    <a class='othername'>群聊</a>
                </div>
                `)
    //设置用户
    data.forEach(item => {
    //设置新增用户的头像和名字
    var img='images/'+item.image
    $('.list').append(`
    <div class="user"><img src="${img}" alt="">
    <a class='othername'>${item.name}</a>
    </div>
    `)
    // //设置用户聊天面板
    // liaotian(item.name)
})

})

/*
聊天
*/
//发送消息
$('.mainsend .btnsend').on('click',function(e){
   mymsg=$('.mainsend #content').text()
   html=$('.mainsend #content').html().trim()
   var x=html.indexOf('<img class=')				
   var y=html.indexOf('src="lib/img/')
   var z=html.indexOf('>')
   var index=-1
   if(x!=-1&&y!=-1&&z!=-1){
    index=1
   }
  //告诉给所有用户
   socket.emit('sendmessge',{avatar:myavatar,name:myname,msg:mymsg,toname:toname,index:index,
   img:html})
})
/*
接收普通聊天消息
*/
//接收zj消息，自己接受自己的
socket.on('receviemesggemyself',data=>{
  if (data.index===-1){
    //文字消息
  if(data.name===myname){
  $('.'+data.toname).append(`
  <div class="message-box">
    <div class="my-message">
     <div class="nickname">${data.name}</div>
     <div class="content">
       <div class="bubble">
      <div class="bubble_cont">${data.msg}</div>
       </div>
     </div>
      <img src="${data.avatar}" alt="" class="avatar">
    </div>
    </div><br>`)
  }else {
    $('.'+data.toname).append(`
    <div class="message-box">
      <div class="other-message">
        <div class="nickname">${data.name}</div>
        <img src="${data.avatar}" alt="" class="avatar">
        <div class="content">
          <div class="bubble">
            <div class="bubble_cont">${data.msg}</div>
          </div>
        </div>
      </div>
      </div><br>`)
  }
}else{
   //表情包消息
  if(data.name===myname){
    $('.'+data.toname).append(`
    <div class="message-box">
      <div class="my-message">
        <div class="nickname">${data.name}</div>
        <div class="content">
        <div class="bubble">
          <div class="bubble_cont">${data.img}</div>
        </div>
      </div>
        <img src="${data.avatar}" alt="" class="avatar">
      </div>
      </div><br>`)
    }else {
      $('.'+data.toname).append(`
      <div class="message-box">
        <div class="other-message">
          <div class="nickname">${data.name}</div>
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.img}</div>
            </div>
          </div>
        </div>
        </div><br>`)
    }
}
    scrollIntoView(data.toname)
    //清空
    $('.mainsend #content').text('')
    
})
//他人接受自己的
socket.on('receviemesggeother',data=>{
  if (data.index===-1){
  if(data.name===myname){
  $('.'+data.name).append(`
  <div class="message-box">
    <div class="my-message">
      <div class="nickname">${data.name}</div>
      <div class="content">
        <div class="bubble">
          <div class="bubble_cont">${data.msg}</div>
        </div>
      </div>
      <img src="${data.avatar}" alt="" class="avatar">
    </div>
    </div><br>`)
  }else {
    $('.'+data.name).append(`
    <div class="message-box">
      <div class="other-message">
        <div class="nickname">${data.name}</div>
        <img src="${data.avatar}" alt="" class="avatar">
        <div class="content">
          <div class="bubble">
            <div class="bubble_cont">${data.msg}</div>
          </div>
        </div>
      </div>
      </div><br>`)
  }
}else{
  //表情包消息
  if(data.name===myname){
    $('.'+data.name).append(`
    <div class="message-box">
      <div class="my-message">
        <div class="nickname">${data.name}</div>
        <div class="content">
          <div class="bubble">
            <div class="bubble_cont">${data.img}</div>
          </div>
        </div>
        <img src="${data.avatar}" alt="" class="avatar">
      </div>
      </div><br>`)
    }else {
      $('.'+data.name).append(`
      <div class="message-box">
        <div class="other-message">
          <div class="nickname">${data.name}</div>
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.img}</div>
            </div>
          </div>
        </div>
        </div><br>`)
    }
}
    scrollIntoView(data.name)
    //清空
    $('.mainsend #content').text('')
    
})


//发送图片消息的功能
$('#file').on('change',function(){
  var file    = document.querySelector('.maintool input[type=file]').files[0];
  console.log(file)
  var reader  = new FileReader();
  //注册监听事件图片加载完成
  reader.addEventListener("load", function () {
    console.log(reader.result)
    mymsg=reader.result
  //发送图片给用户
  socket.emit('sendImage',{
    avatar:myavatar,
    name:myname,
    msg:mymsg,
    toname:toname,
    index:-1
  })
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
})


//接受图片消息
//接收zj消息
socket.on('recevieImagemyself',data=>{
  if(data.name===myname){
  $('.'+data.toname).append(`
  <div class="message-box">
    <div class="my-message">
      <div class="nickname">${data.name}</div>
      <div class="content">
        <div class="bubble_cont">
          <img class='tupian' src="${data.msg}">
        </div>
      </div>
      <img src="${data.avatar}" alt="" class="avatar">
    </div>
    </div><br>`)
  }else {
    $('.'+data.toname).append(`
    <div class="message-box">
      <div class="other-message">
        <div class="nickname">${data.name}</div>
        <img src="${data.avatar}" alt="" class="avatar">
        <div class="content">
           <div class="bubble_cont">
             <img class='tupian' src="${data.msg}">
           </div>
        </div>
      </div>
      </div><br>`)
  }
    scrollIntoView(data.toname)
    //清空
    $('.mainsend #content').text('')
})
//接受图片消息
//接收他人消息
socket.on('recevieImageother',data=>{
  if(data.name===myname){
  $('.'+data.name).append(`
  <div class="message-box">
    <div class="my-message">
      <div class="nickname">${data.name}</div>
      <div class="content">
        <div class="bubble_cont">
          <img class='tupian' src="${data.msg}">
        </div>
      </div>
      <img src="${data.avatar}" alt="" class="avatar">
    </div>
    </div><br>`)
  }else {
    $('.'+data.name).append(`
    <div class="message-box">
      <div class="other-message">
        <div class="nickname">${data.name}</div>
        <img src="${data.avatar}" alt="" class="avatar">
        <div class="content">
           <div class="bubble_cont">
             <img class='tupian' src="${data.msg}">
           </div>
        </div>
      </div>
      </div><br>`)
  }
    scrollIntoView(data.name)
    //清空
    $('.mainsend #content').text('')
})



/*
查看历史记录功能
*/
// await操作符用于等待一个 Promise 兑现并获取它兑现之后的值。它只能在异步函数或者模块顶层中使用。
 $('#filehistory').on('click',()=>{
// 增加一个历史记录面板
  $('.box2 .liaotian').append(`
 <div class='history' id='history' maincomment style="display:none;"></div> 
  `)
  $(".liaotian ."+toname).attr("style","display:none;"); //隐藏div
  // 显示历史聊天记录
  $(".liaotian .history").attr("style","display:block;");//显示div
  history()
  $('#maintitle').text("聊天记录")
});
/*
关闭历史记录
*/ 
$('#close').on('click',()=>{
  document.getElementById('history').remove();
  $(".liaotian .history").attr("style","display:none;");//隐藏div
  // 显示聊天窗口
  $(".liaotian ."+toname).attr("style","display:block;");//显示div
  $('#maintitle').text(toname)
})

//查看历史记录函数
async function history(){
   const response=await fetch(`/history?myname=${myname}&toname=${toname}`)
    if(response.ok)
    {
     const data=await response.json()
     console.log('------------')
     console.log(data)
     console.log('------------')
    // console.log(data.chat[0].name)
    //清空
     $('.history').html('')
     console.log(data.chat.length)
     if(data.chat.length!=0){
  data.chat.forEach(element => {
    if(element.name===myname){
    //自己历史的消息
    if(element.index===-1){//不是表情
    if(element.msg.indexOf("data:image/")!=-1){  //图片消息
     $('.history').append(`
    <div class="messege-box">
      <div class="my-message" style="text-align: right;">
       <div class="nickname"
       style="
       display: block;
     background-image: -webkit-linear-gradient(left,blue,#66ffff 10%,#cc00ff 20%,#CC00CC 30%, #CCCCFF 40%, #00FFFF 50%,#CCCCFF 60%,#CC00CC 70%,#CC00FF 80%,#66FFFF 90%,blue 100%);
       -webkit-background-clip: text;
     -webkit-text-fill-color: transparent;
       ">${element.name}</div>
       <div class="content"
       style="
       display: inline-block;
       border-style:ridge;
       border-width:5px;
       border-color:deepskyblue;
       border-radius:10%;
       ">
         <div class="bubble">
           <div class="bubble_cont"><img class='tupian' src="${element.msg}"></div>
         </div>
        </div>
      <img src="${element.avatar}" alt="" class="avatar"
      style="
          height: 40px;
          width: 40px;
          border-radius: 50%;
          display: inline-block;
          ">
    </div>
    </div>
     `)}else{//文字消息
      $('.history').append(`
   <div class="messege-box">
    <div class="my-message" style="text-align: right;">
         <div class="nickname"
         style="
         display: block;
       background-image: -webkit-linear-gradient(left,blue,#66ffff 10%,#cc00ff 20%,#CC00CC 30%, #CCCCFF 40%, #00FFFF 50%,#CCCCFF 60%,#CC00CC 70%,#CC00FF 80%,#66FFFF 90%,blue 100%);
         -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
         ">${element.name}</div>
        <div class="content"
        style="
       display: inline-block;
       border-style:ridge;
       border-width:5px;
       border-color:deepskyblue;
       border-radius:10%;
       ">
          <div class="bubble">
            <div class="bubble_cont">${element.msg}</div>
          </div>
        </div>
        <img src="${element.avatar}" alt="" class="avatar"
        style="
          height: 40px;
          width: 40px;
          border-radius: 50%;
          display: inline-block;
          ">
    </div>
   </div>
      `)
     }
    }else{//表情
      $('.history').append(`
      <div class="message-box">
       <div class="my-message" style="text-align: right;">
          <div class="nickname"
          style="
          display: block;
        background-image: -webkit-linear-gradient(left,blue,#66ffff 10%,#cc00ff 20%,#CC00CC 30%, #CCCCFF 40%, #00FFFF 50%,#CCCCFF 60%,#CC00CC 70%,#CC00FF 80%,#66FFFF 90%,blue 100%);
          -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
          ">${element.name}</div>
          <div class="content"
          style="
       display: inline-block;
       border-style:ridge;
       border-width:5px;
       border-color:deepskyblue;
       border-radius:10%;
       ">
            <div class="bubble">
              <div class="bubble_cont">${element.img}</div>
            </div>
          </div>
          <img src="${element.avatar}" alt="" class="avatar"
          style="
          height: 40px;
          width: 40px;
          border-radius: 50%;
          display: inline-block;
          ">
        </div>
      </div>`)
    }
  }else{
    //她人的历史的消息
    if(element.index===-1){//不是表情
    if(element.msg.indexOf("data:image/")!=-1){//图片消息
     $('.history').append(`
     <div class="messege-box">
     <div class="other-message">
       <div class="nickname"
       style="
       display: block;
     background-image: -webkit-linear-gradient(left,blue,#66ffff 10%,#cc00ff 20%,#CC00CC 30%, #CCCCFF 40%, #00FFFF 50%,#CCCCFF 60%,#CC00CC 70%,#CC00FF 80%,#66FFFF 90%,blue 100%);
       -webkit-background-clip: text;
     -webkit-text-fill-color: transparent;
       ">${element.name}</div>
       <img src="${element.avatar}" alt="" class="avatar"
       style="
          height: 40px;
          width: 40px;
          border-radius: 50%;
          display: inline-block;
          ">
       <div class="content"
       style="
       display: inline-block;/*设置为内联块元素*/
    border-style:ridge;
    border-width:5px;
    border-color:darkgray;
    border-radius:10%;
       ">
         <div class="bubble">
           <div class="bubble_cont"><img class='tupian' src="${element.msg}"></div>
         </div>
        </div>
      </div>
     </div>
     `)}else{//文字消息
      $('.history').append(`
   <div class="messege-box">
   <div class="other-message">
          <div class="nickname"
          style="
          display: block;
        background-image: -webkit-linear-gradient(left,blue,#66ffff 10%,#cc00ff 20%,#CC00CC 30%, #CCCCFF 40%, #00FFFF 50%,#CCCCFF 60%,#CC00CC 70%,#CC00FF 80%,#66FFFF 90%,blue 100%);
          -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
          ">${element.name}</div>
          <img src="${element.avatar}" alt="" class="avatar"
          style="
          height: 40px;
          width: 40px;
          border-radius: 50%;
          display: inline-block;
          ">
         <div class="content"
         style="
       display: inline-block;/*设置为内联块元素*/
       border-style:ridge;
       border-width:5px;
       border-color:darkgray;
       border-radius:10%;
       ">
          <div class="bubble">
            <div class="bubble_cont">${element.msg}</div>
          </div>
         </div>
    </div>
   </div>
      `)
     }
    }else{//表情消息
      $('.history').append(`
      <div class="message-box">
      <div class="other-message">
          <div class="nickname"
          style="
          display: block;
        background-image: -webkit-linear-gradient(left,blue,#66ffff 10%,#cc00ff 20%,#CC00CC 30%, #CCCCFF 40%, #00FFFF 50%,#CCCCFF 60%,#CC00CC 70%,#CC00FF 80%,#66FFFF 90%,blue 100%);
          -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
          ">${element.name}</div>
          <img src="${element.avatar}" alt="" class="avatar" 
          style="
          height: 40px;
          width: 40px;
          border-radius: 50%;
          display: inline-block;
          ">
          <div class="content"
          style="
          display: inline-block;/*设置为内联块元素*/
          border-style:ridge;
          border-width:5px;
          border-color:darkgray;
          border-radius:10%;
       ">
            <div class="bubble">
              <div class="bubble_cont">${element.img}</div>
            </div>
          </div>
        </div>
      </div>`)
    }
  }
    });
    }  
  }
}

//点击用户的事件绑定
$('.box2 .box-left .list').on('click', function (e) {
  if(e.target.tagName==='DIV'){
  var $div=$(e.target)
  var mianban=$div.children('.othername').text()
  const yonghu = document.getElementById("liaotian").children
  for(var i=0;i<yonghu.length;i++)
  {
    if(yonghu[i].className===mianban){
      break;
    }
      console.log(yonghu[i].className)
   }
   //如果不存在该面板则添加
   if(i===yonghu.length&&mianban!='群聊'){ liaotian(mianban)}
   //否则不添加

  //实现当前面板的隐藏和要聊天对象的出现,none修饰的元素不会被渲染和占用空间
  //因此只需要隐藏即可
  console.log("----------")
  console.log(toname)
  console.log("----------")
  $(".liaotian ."+toname).attr("style","display:none;");//隐藏div
  $div.addClass('active').siblings().removeClass('active')
  $('.box2 .box-left .friendlist .active').removeClass('active')
  toname = $div.children('.othername').text()  //全局变量
  $('#maintitle').text(toname)
  console.log("----------")
  console.log(toname)
  console.log("----------")
  $(".liaotian ."+toname).attr("style","display:block;");//显示div
  }
})

//点击好友的事件绑定
$('.box2 .box-left .friendlist').on('click', function (e) {

  if(e.target.tagName==='DIV'){
    var $div=$(e.target)
    var mianban=$div.children('.othername').text()
    const yonghu = document.getElementById("liaotian").children
    for(var i=0;i<yonghu.length;i++)
    {
      if(yonghu[i].className===mianban){
        break;
      }
        console.log(yonghu[i].className)
     }
     //如果不存在该面板则添加
     if(i===yonghu.length&&mianban!='群聊'){ liaotian(mianban)}
     //否则不添加
  
    //实现当前面板的隐藏和要聊天对象的出现,none修饰的元素不会被渲染和占用空间
    //因此只需要隐藏即可
    console.log("----------")
    console.log(toname)
    console.log("----------")
    $(".liaotian ."+toname).attr("style","display:none;");//隐藏div
    $div.addClass('active').siblings().removeClass('active')
    $('.box2 .box-left .list .active').removeClass('active')
    toname = $div.children('.othername').text()  //全局变量
    $('#maintitle').text(toname)
    console.log("----------")
    console.log(toname)
    console.log("----------")
    $(".liaotian ."+toname).attr("style","display:block;");//显示div
    }


})


//DOM对象才有这个事件，其他不行不知道为什么
//右键事件list绑定
document.getElementById('list').oncontextmenu = function(e){
       $('.menuadd').html('')
       var $add=$('.menuadd')
       $add.append(`<div class="menu__add">添加好友</div>`)
       $add.attr("style","display:block;");//显示div
        const menu=document.getElementById('menuadd');
        //根据事件对象中鼠标点击的位置，进行定位
        if(e.target.tagName==='DIV'){
        menu.style.left=e.clientX-290+'px';
        menu.style.top=e.clientY-150+'px';
        $add.children(".menu__add").on('click',function(){
          var $div=$(e.target)
          var friendname = $div.children('.othername').text()
          var friendavatar = $div.children('img').attr('src')
          //添加好友事件
          addfriend(friendavatar,friendname)
        })
        }
}
//添加好友函数
async function addfriend(friendavatar,friendname){
  const response=await fetch(`/addfriend?myname=${myname}&myavatar=${myavatar}&friendname=${friendname}&friendavatar=${friendavatar}`)
   if(response.ok)
   {
    const data=await response.json()
    console.log('------------')
    console.log(data.sucess)
    console.log('------------')
    if(data.sucess){
    alert('添加成功')
    //注册一个添加好友成功事件
    socket.emit('toadd')
    }else{
    alert('已存在该好友')
    }
  }else{
    alert('添加失败')
  }
  }
/*
删除好友事件
*/
  document.getElementById('friendlist').oncontextmenu = function(e){
    $('.menudel').html('')
    var $del= $('.menudel')
    $del.append(`<div class="menu__del" >删除好友</div>`)
    $del.attr("style","display:block;");//显示div
    const menu=document.getElementById('menudel');
    //根据事件对象中鼠标点击的位置，进行定位
    if(e.target.tagName==='DIV'){
    menu.style.left=e.clientX-290+'px';
    menu.style.top=e.clientY-150+'px';
    $del.children(".menu__del").on('click',function(){
      var $div=$(e.target)
      var friendname = $div.children('.othername').text()
      var friendavatar = $div.children('img').attr('src')
      //删除好友事件
      delfriend(friendavatar,friendname)
    })
    }
}
//删除好友函数
async function delfriend(friendavatar,friendname){
  const response=await fetch(`/delfriend?myname=${myname}&myavatar=${myavatar}&friendname=${friendname}&friendavatar=${friendavatar}`)
   if(response.ok)
   {
    const data=await response.json()
    console.log('------------')
    console.log(data.sucess)
    console.log('------------')
    alert('删除成功')
    //注册一个添加好友删除事件
     socket.emit('todel')
   }
  }
  socket.on("haoyou",()=>{
    friends()
  })


// window区域点击菜单栏均消失
window.onclick = function (e) {
  //清空
  $('.menuadd').html('')
  $('.menudel').html('')
  $('.menuadd').attr("style","display:none;");
  $('.menudel').attr("style","display:none;");
}

// 禁用window区域右键默认菜单弹窗
window.oncontextmenu = function (e) {
  e.preventDefault();
}



//消息滚动到最后(滚动条)
function scrollIntoView(toname){ 
$('.box-right .'+toname)
.children(':last').get(0)
.scrollIntoView(false)
}

/*
表情包
*/
// 初始化jquery-emoji插件
$('.face').on('click', function () {
  $("#content").emoji({
    button: ".face",
    showTab: true,
    animation: 'slide',
    position:'topRight',
    icons: [{
        name: "贴吧表情",
        path: "lib/img/tieba/",
        maxNum: 50,
        file: ".jpg",
        placeholder: ":{alias}:",
        alias: {
            1: "hehe",
            2: "haha",
            3: "tushe",
            4: "a",
            5: "ku",
            6: "lu",
            7: "kaixin",
            8: "han",
            9: "lei",
            10: "heixian",
            11: "bishi",
            12: "bugaoxing",
            13: "zhenbang",
            14: "qian",
            15: "yiwen",
            16: "yinxian",
            17: "tu",
            18: "yi",
            19: "weiqu",
            20: "huaxin",
            21: "hu",
            22: "xiaonian",
            23: "neng",
            24: "taikaixin",
            25: "huaji",
            26: "mianqiang",
            27: "kuanghan",
            28: "guai",
            29: "shuijiao",
            30: "jinku",
            31: "shengqi",
            32: "jinya",
            33: "pen",
            34: "aixin",
            35: "xinsui",
            36: "meigui",
            37: "liwu",
            38: "caihong",
            39: "xxyl",
            40: "taiyang",
            41: "qianbi",
            42: "dnegpao",
            43: "chabei",
            44: "dangao",
            45: "yinyue",
            46: "haha2",
            47: "shenli",
            48: "damuzhi",
            49: "ruo",
            50: "OK"
        },
        title: {
            1: "呵呵",
            2: "哈哈",
            3: "吐舌",
            4: "啊",
            5: "酷",
            6: "怒",
            7: "开心",
            8: "汗",
            9: "泪",
            10: "黑线",
            11: "鄙视",
            12: "不高兴",
            13: "真棒",
            14: "钱",
            15: "疑问",
            16: "阴脸",
            17: "吐",
            18: "咦",
            19: "委屈",
            20: "花心",
            21: "呼~",
            22: "笑脸",
            23: "冷",
            24: "太开心",
            25: "滑稽",
            26: "勉强",
            27: "狂汗",
            28: "乖",
            29: "睡觉",
            30: "惊哭",
            31: "生气",
            32: "惊讶",
            33: "喷",
            34: "爱心",
            35: "心碎",
            36: "玫瑰",
            37: "礼物",
            38: "彩虹",
            39: "星星月亮",
            40: "太阳",
            41: "钱币",
            42: "灯泡",
            43: "茶杯",
            44: "蛋糕",
            45: "音乐",
            46: "haha",
            47: "胜利",
            48: "大拇指",
            49: "弱",
            50: "OK"
        }
    }, {
        name: "QQ高清",
        path: "lib/img/qq/",
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: ".gif",
        placeholder: "#qq_{alias}#"
    }, {
        name: "emoji高清",
        path: "lib/img/emoji/",
        maxNum: 84,
        file: ".png",
        placeholder: "#emoji_{alias}#"
    }]
});
})
//返回主界面
$('.index').on('click',()=>{
  $('.box2').hide()
  $('.box3').hide()
  $('.box4').hide()
  $('.box1').fadeIn()
})
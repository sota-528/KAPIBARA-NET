const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

const users = [
 {username:"りゅうせい", id:"kajiwara", password:"ryuseidayo"},
 {username:"そうた", id:"nagano", password:"nagaso"},
 {username:"まと", id:"ota", password:"mato"}
]

let onlineUsers = {}

io.on("connection",(socket)=>{

 socket.on("login",(data)=>{

  const user = users.find(u=>u.id===data.id && u.password===data.password)

  if(user){

   onlineUsers[socket.id] = user.username

   socket.emit("login_success",user.username)

   io.emit("user_list",Object.values(onlineUsers))

   io.emit("system_message",user.username+" が接続しました")

  }else{
   socket.emit("login_failed")
  }

 })

 socket.on("chat_message",(msg)=>{
  const username = onlineUsers[socket.id]
  if(username){
   io.emit("chat_message",{user:username,message:msg})
  }
 })

 socket.on("disconnect",()=>{
  const username = onlineUsers[socket.id]
  delete onlineUsers[socket.id]

  io.emit("user_list",Object.values(onlineUsers))

  if(username){
   io.emit("system_message",username+" が切断しました")
  }
 })

})

server.listen(process.env.PORT || 3000,()=>{
 console.log("KAPIBARA-NET started")
})
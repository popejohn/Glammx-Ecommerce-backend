const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const connection = require('./DbConfig/db.config')
const projectroutes = require('./Routers/project.routes')
const socket = require('socket.io')
const messageModel = require('./Models/Chats.model')




// middlewares
app.use(cors({origin: "*"}))
app.use(express.json({limit:"50mb"}))
app.use('/', projectroutes)






connection()


let port = process.env.port || 5007

const portconnection = app.listen(port, () => {
    console.log(`app opened in port ${port}`);
    
})

const activeUsers = []

const io = socket(portconnection, {
    cors: {origin: "*"}
})

io.on("connection", async(socket) => {
    console.log('a user connected')

    socket.on('user_chats', async(userId) => {
    
        const existinguser = activeUsers.filter((user) => user.email === userId.email)
        if (!existinguser.length){
          activeUsers.push(userId)
        
        }
        const allChats = await messageModel.find()
        if (allChats){
            const userChats = allChats.filter((chat) => chat.sender === userId.email || chat.recipient === userId.email)
            socket.emit('chats', (userChats))
        }

         // Send all active users
        socket.emit('active_users', (activeUsers))
        
    })

    // Send all active users
    socket.emit('active_users', (activeUsers))

    socket.on('send_message', async({sender, recipient, message}) =>{
        const usermessage = {
            sender,
            recipient,
            message
        }
        socket.emit('user_response', (usermessage))
        const newMessage = await messageModel.create({sender, recipient, message })
    }) //Works

    

    socket.on('selected_user', async(user) => {
        const selectedUser = await messageModel.find()
        const userSupportChats = selectedUser.filter((msg) => msg.sender === user.email || msg.recipient === user.email)
        
        socket.emit('user_support_chat', (userSupportChats))
    })

    // Gets support's response to be sent to selected user support is chatting
    socket.on('support_response', async(supportResponse) => { 
        const newSupportResponse = await messageModel.create(supportResponse)
        socket.emit('response', (supportResponse))
    })
})



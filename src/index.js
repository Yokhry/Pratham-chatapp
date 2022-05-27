const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUserInRoom} =  require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)



const port = process.env.PORT || 3000
const publicDirectoryPath =  path.join(__dirname,'../public')   //we use this to access our html file for our web developement

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
    console.log('New Web Socket Connection')

    

    //setting up listener for join
    socket.on('join', (options,callback)=>{
       const {error, user} =  addUser({id: socket.id, ...options})

       if(error){
            return callback(error)
       }


        socket.join(user.Room)

        socket.emit('message',generateMessage('Admin','Welcome!!'))

    //broadcast.emit is used to give message when a user joined the chat
    socket.broadcast.to(user.Room).emit('message',generateMessage('Admin',`${user.Username} has joined`))

    io.to(user.Room).emit('RoomData',{
        Room:user.Room,
        users: getUserInRoom(user.Room)
    })

    callback()


        
        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit  this is we using
    
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id) 
    

        const filer = new Filter()
        if(filer.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.Room).emit('message',generateMessage(user.Username,message))
        callback()

    
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
    

        io.to(user.Room).emit('locationMessage',generateLocationMessage(user.Username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    
    })
    //this is used to know when a user leaves
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.Room).emit('message',generateMessage('Admin',`${user.Username} has left`))
            io.to(user.Room).emit('RoomData',{
                Room: user.Room,
                users: getUserInRoom(user.Room)
            })
        }

     })

})



server.listen(port, ()=>{
    console.log('server is up on port ',port)
})
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { getMessage, getLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', getMessage("Admin",'Welcome! User, have a great time.'))
        socket.broadcast.to(user.room).emit('message', getMessage("Admin",`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if(user) {
            const filter = new Filter()
            if (filter.isProfane(message)) {
                return callback('Profanity is not allowed!')
            }
            io.to(user.room).emit('message', getMessage(user.username, message))
            callback()
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        if(user) {
            io.to(user.room).emit('locationMessage', getLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
            callback()
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', getMessage("Admin",`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

module.exports = {
    app,
    server
}
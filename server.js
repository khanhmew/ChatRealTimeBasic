const express = require('express')
const path = require('path');
const app = express()
const http = require('http').createServer(app);
app.use(express.static(path.join(__dirname, 'public')))

const io = require('socket.io')(http)
io.on('connection', socket => {
    socket.on('sendMessage', msg => {
        socket.broadcast.emit('chat-chanel', msg)
    });
    socket.on('sendPublicKey', msg => {
        socket.broadcast.emit('key-chanel', msg)
    });
})

http.listen(3000, () => {
    console.log('Server is running on port 3000')
})
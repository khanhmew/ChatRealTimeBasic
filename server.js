const express = require('express')
const path = require('path');
const app = express()
const http = require('http').createServer(app);

const NodeCache = require("node-cache");
const messageCache = new NodeCache();

const usersRooms = {};
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '/public/index.html');
    res.sendFile(filePath);
});
// Define a route that serves the HTML file
app.get('/chat', (req, res) => {
    let filePath = path.join(__dirname, '/public/pageChat.html');
    res.sendFile(filePath);
});


const io = require('socket.io')(http)
// Store user data and their respective rooms in an object

io.on('connection', socket => {
    console.log('user connected: ' + socket.id)

    // Xử lý khi user gửi tin nhắn
    socket.on('sendMessage', msg => {
        let messageInCache = messageCache.get(msg.roomId);

        if (!messageInCache) {
            messageInCache = [];
        }

        messageInCache.push(msg);
        messageCache.set(msg.roomId, messageInCache, 60 * 60);

        io.to(msg.roomId).emit('chat-chanel', msg);
    });

    // Xử lý khi user gửi public key
    socket.on('sendPublicKey', msg => {
        socket.broadcast.emit('key-chanel', msg)
        console.log(msg);
    });

    socket.on('changeRoom', changeRoomInfo => {

        if (usersRooms[socket.id]) {
            socket.leave(usersRooms[socket.id]);
            console.log(`User left room: ${usersRooms[socket.id]}`);
        }
        socket.join(changeRoomInfo.roomId);
        // Update the user's current room
        usersRooms[socket.id] = changeRoomInfo.roomId;
        
        console.log(changeRoomInfo.roomId + ' ' + socket.id);

        let messageInCache = messageCache.get(changeRoomInfo.roomId);

        if (messageInCache) {
            console.log('Message in cache: ', messageInCache.length)
            messageInCache.forEach((element, index) => {
                io.to(socket.id).emit('chat-chanel', element);
            });
        }
    });


});

http.listen(3000, () => {
    console.log('Server is running on port 3000')
})
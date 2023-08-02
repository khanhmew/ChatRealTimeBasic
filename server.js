const express = require('express')
const path = require('path');
const app = express()
const http = require('http').createServer(app);

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

// Route handler with a dynamic parameter
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`You requested user with ID: ${userId}`);
  });
  

const io = require('socket.io')(http)
// Store user data and their respective rooms in an object
const users = {};
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
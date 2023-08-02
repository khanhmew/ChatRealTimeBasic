const socket = io();
const msgText = document.querySelector('#msg')
const btnSend = document.querySelector('#btn-send')
const chatBox = document.querySelector('.chat-content')
const displayMsg = document.querySelector('.message')
let currentRoomId = "room1";
const name = localStorage.getItem('name');
document.querySelector('#your-name').textContent = name
msgText.focus()

btnSend.addEventListener('click', (e) => {
    e.preventDefault()
    sendMsg(msgText.value)
    msgText.value = "";
    msgText.focus()
})


// Add keypress event listener for the input field
msgText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMsg(msgText.value);
        msgText.value = "";
        msgText.focus();
    }
});

const display = (msg, type) => {
    const msgDiv = document.createElement('div');
    let className = type
    msgDiv.classList.add(className, 'message-row')
    let times = new Date().toLocaleTimeString()

    let innerText = `
    <div class="message-title">
        👻<span>${msg.user}</span>
     </div>
    <div class="message-text">
        ${msg.message}
    </div>
    <div class="message-time">
        ${times}
    </div>
    `;
    msgDiv.innerHTML = innerText;
    displayMsg.appendChild(msgDiv)
}

// ===============================================================
// Generate ECDSA key pair
const ec = new elliptic.ec('secp256k1');
const keyPair = ec.genKeyPair();

const publicKey = keyPair.getPublic('hex');
const privateKey = keyPair.getPrivate('hex');


let isSendKey = false;
const sendMsg = message => {
    if(message.trim() !== '' && message.trim() !== null){
            const signature = keyPair.sign(message).toDER('hex');
            console.log(currentRoomId);
            let msg = {
                user: name,
                roomId: currentRoomId,
                message: message.trim(),
                signature: signature
            }
            display(msg, 'you-message')

            if (!isSendKey) {
                let msg = {
                    user:name,
                    key: publicKey
                }
                socket.emit('sendPublicKey', msg);
                
            }

            socket.emit('sendMessage', msg);

            chatBox.scrollTop = chatBox.scrollHeight;
    }
}
// handle room click

function changeRoom(element) {
// Show the ID using the alert function
    var roomId = element.getAttribute('id');
    // Get the parent div element with class "list-group"
    var listGroup = document.querySelector('.list-group');

    // Get all anchor elements within the parent div
    var anchorElements = listGroup.querySelectorAll('a');

    // Loop through all anchor elements
    anchorElements.forEach(function(anchor) {
      // Remove the "active" class from each anchor element
      anchor.classList.remove('active');
    });
    element.classList.add('active');
   // Emit a message to the server that the user has changed the room
    currentRoomId = roomId;
    socket.emit('changeRoom', roomId);
    displayMsg.innerHTML = '';
}


// when recieve message
socket.on('chat-chanel', msg => {
    if(msg.user !== name)
    {
        const keyPairB = ec.keyFromPublic(localStorage.getItem('publicKey'+msg.user), 'hex');

        const isSignatureValid = keyPairB.verify(msg.message, msg.signature);

        if (isSignatureValid) {
            console.log("Message hợp lệ");
        }
        else {
            console.log("Message không hợp lệ");
            msg.message = msg.message + ' ' + "(KHÔNG HỢP LỆ)";

        }

        display(msg, 'other-message');
       
    }
    chatBox.scrollTop = chatBox.scrollHeight;
})

socket.on('key-chanel', msg => {
    
    localStorage.setItem("publicKey"+msg.user, msg.key);
})
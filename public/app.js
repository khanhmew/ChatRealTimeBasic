const socket = io();
const msgText = document.querySelector('#msg')
const btnSend = document.querySelector('#btn-send')
const chatBox = document.querySelector('.chat-content')
const displayMsg = document.querySelector('.message')
let name;
do {
    name = prompt('What is your name?')
} while (!name)
document.querySelector('#your-name').textContent = name
msgText.focus()

btnSend.addEventListener('click', (e) => {
    e.preventDefault()
    sendMsg(msgText.value)
    msgText.value = "";
    msgText.focus()
})

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
    const signature = keyPair.sign(message).toDER('hex');

    let msg = {
        user: name,
        message: message.trim(),
        signature: signature
    }
    display(msg, 'you-message')

    if (!isSendKey) {
        socket.emit('sendPublicKey', publicKey);
        isSendKey = true;
    }

    socket.emit('sendMessage', msg);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// when recieve message
socket.on('chat-chanel', msg => {
    display(msg, 'other-message');
    const keyPairB = ec.keyFromPublic(localStorage.getItem('publicKey'), 'hex');

    const isSignatureValid = keyPairB.verify(msg.message, msg.signature);

    if (isSignatureValid) {
        console.log("Message hợp lệ");
    }
    else {
        console.log("Message không hợp lệ");

    }
    chatBox.scrollTop = chatBox.scrollHeight;
})

socket.on('key-chanel', key => {
    console.log("Key receive", key);
    localStorage.setItem('publicKey', key);
})
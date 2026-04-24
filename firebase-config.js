import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyADYulYcS190uj8kwOFkIlUAR3vfdjMJJk",
    authDomain: "the-os-b8241.firebaseapp.com",
    projectId: "the-os-b8241",
    storageBucket: "the-os-b8241.firebasestorage.app",
    messagingSenderId: "185781518483",
    appId: "1:185781518483:web:a5a60fb1b844c448c24d66"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const coinsRef = ref(db, 'gloria_coins');
const messagesRef = ref(db, 'gloria_messages');

onValue(coinsRef, (snapshot) => {
    document.getElementById('coinDisplay').innerText = snapshot.val() || 0;
});

window.dbRunTransaction = function(amount) {
    runTransaction(coinsRef, (currentCoins) => {
        return (currentCoins || 0) + amount;
    });
};

window.dbSaveMessage = function(type, content) {
    const newMsgRef = push(messagesRef);
    set(newMsgRef, {
        type: type,
        text: content,
        timestamp: new Date().toLocaleString()
    });
};

window.loadAdminData = function() {
    onValue(messagesRef, (snapshot) => {
        const box = document.getElementById('adminMessages');
        box.innerHTML = '';
        const data = snapshot.val();
        if(data) {
            Object.values(data).reverse().forEach(msg => {
                box.innerHTML += `<div class="admin-msg">
                    <strong style="color: #0f0;">[${msg.timestamp}] ${msg.type}:</strong><br>
                    ${msg.text}
                </div>`;
            });
        } else {
            box.innerHTML = "No messages yet.";
        }
    });
};

const socket = io.connect('http://localhost:7000', { 'forceNew': true });

const status = {
    logged: false,
    currentui: "login-ui"
}

function login () {
    hideError();
    const username = document.getElementById("username-input").value;
    status.username = username;
    socket.emit("login", {username});
}

function showUI (name) {
    document.getElementById(status.currentui).style.display = "none";
    document.getElementById(name).style.display = "block";

    status.currentui = name;
}

function displayError (error) {
    if (status.logged) {

    } else {
        let obj = document.getElementById("login-error");
        obj.innerHTML = error;
        obj.style.display = "block";
    }
}

function hideError () {
    if (status.logged) {

    } else {
        let obj = document.getElementById("login-error");
        obj.style.display = "none";
    }
}

function addChat (author, message) {
    const list = document.getElementById("chat-list");
    const isBC = (author == null);
    const isOwn = (author == status.username);

    message = message.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    list.innerHTML = list.innerHTML + `
    <div class="message-item${(isBC ? " broadcast" : (isOwn ? " own-msg" : ""))}">
        ${(author != null ? " <span class=\"message-author\">" + author + "</span>" : "")}
        <span class="message-content">${message}</span>
    </div>
    `;

    list.scrollTop = list.scrollHeight; 
}

function sendMessage () {
    const obj = document.getElementById("message-input");
    const text = obj.value;
    obj.value = "";

    socket.emit("chat", { message: text });
}

socket.on("chat", (data) => {
    addChat(data.username, data.message);
})

socket.on("pop", (pop) => {
    if (pop.type == "error") {
        displayError(pop.message);
    }
});

socket.on("broadcast", (b) => {
    let { message } = b;

    addChat(null, message);
})

socket.on("login", () => {
    status.logged = true;
    showUI("chat-ui");
});

socket.on("disconnect", () => {
    status.logged = false;
    showUI("login-ui");
    displayError("Disconnected from the server");
});

socket.on("error", () => {
    status.logged = false;
    showUI("login-ui");
    displayError("Connection loss to the server.");
})

window.addEventListener("load", () => {
    document.getElementById('username-input').onkeypress = function(e){
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            login();
            return false;
        }
    }

    document.getElementById('message-input').onkeypress = function(e){
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            sendMessage();
            return false;
        }
    }
})
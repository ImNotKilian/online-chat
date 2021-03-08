const registeredUsers = new Set();

export default function (io) {
    io.on('connection', function (socket) {
        
        socket.on("login", (data) => {
            let { username } = data;

            if (username == null || username == "" || typeof username != "string") {
                return socket.emit("pop", { type:"error", message: "Please, specify an username."});
            }

            if (username.length > 16) {
                return socket.emit("pop", { type:"error", message: "Username too long. (" + username.length + " of max 16)"});
            }

            if (username.length < 3) {
                return socket.emit("pop", { type:"error", message: "Username too short. (" + username.length + " of min 3)"});
            }

            if (isUsernameRegistered(username)) {
                return socket.emit("pop", { type:"error", message:"Username already logged."});
            }

            registerUser(username, socket);
            socket.emit("login");
        });

        socket.on("error", () => {
            unregisterUser(socket);
        })

        socket.on("disconnect", () => {
            unregisterUser(socket);
        });

        socket.on("chat", (packet) => {
            let msg = packet.message;
            if (msg == null || msg == "") {
                return;
            }

            chat(socket, packet.message);
        })
    });   
}

function broadcast (message) {
    for (let user of registeredUsers) {
        user.socket.emit("broadcast", {message});
    }
}

function chat (socketEmitter, message) {
    for (let user of registeredUsers) {
        if (user.socket == socketEmitter) {
            let username = user.username;
            for (let reg of registeredUsers) {
                reg.socket.emit("chat", { username: username, message  });
            }
        }
    }
}

function isUsernameRegistered (username) {
    for (let user of registeredUsers) {
        if (user.username.toLowerCase() == username.toLowerCase()) {
            return true;
        }
    }

    return false;
}

function registerUser (username, socket) {
    registeredUsers.add({
        username, socket
    });

    broadcast("User " + username + " join to the chat.");
}

function unregisterUser (socket) {
    for (let user of registeredUsers) {
        if (user.socket == socket) {
            registeredUsers.delete(user);
            broadcast("User " + user.username + " left the chat.");
        }
    }
}
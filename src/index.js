// Import of Libraries
import express from "express";
import http from "http";
import morgan from "morgan";
import path from "path";
import socketio from "socket.io";
import socket from "./socket";

// Objects
const app = express();
const server = http.Server(app);
const io = socketio(server);

// Configuration
app.set("port", 7000);
app.set("host", "127.0.0.1");

// Engine settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));

// Routes
app.all("*", (req, res) => {
    res.render("main");
});

// Prepare socket
socket(io);

// Listener
server.listen(app.get("port"), app.get("host"), () => {
    console.log(`App listening on http://${app.get("host")}:${app.get("port")}/`);
});
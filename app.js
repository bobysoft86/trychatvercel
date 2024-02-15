
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const Room = require("./room");
const cors = require('cors');



const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');

  //aqui hay un cambio para comprobar vercel
  next();
});
app.use(cors({
  origin: ["*",'http://localhost:4200','http://127.0.0.1:5500'],
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server);

const room = new Room();

io.on("connection", async (socket) => {
  const roomID = await room.joinRoom();
  // join room
  socket.join(roomID);

  socket.on("send-message", (message) => {
    socket.to(roomID).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    // leave room
    room.leaveRoom(roomID);
  });
});

server.on("error", (err) => {
  console.log("Error opening server");
});
const port = process.env.PORT || 8001;
server.listen(port, () => {
  console.log(`Server working on port ${port}`);
});
const express = require('express')
const app = express()
const cors = require('cors')
const routes = require('./routes/index.js')
const dotenv = require('dotenv');


dotenv.config();
app.use(express.json())
app.use(cors())
app.use('/api', routes)

const httpServer = require('http').createServer(app)
const { Server } = require("socket.io");
const io = new Server(httpServer);

io.on("connection", (socket) => {
    socket.on("join-room", (roomId,userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit("user-connected",userId)
      });

      socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("user-disconnected",userId)
      });
  
  });

let PORT;
process.env.STATUS === 'production'
? (PORT = process.env.PROD_PORT)
: (PORT = process.env.DEV_PORT);

httpServer.listen(PORT,()=>{
    console.log(`Server in ${process.env.STATUS} mode, listening on *:${PORT}`);
})

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const sequelize = require("./utils/database");

const socketAuth = require("./middlewares/socketAuth");
const adminRoutes = require("./routes/admin");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true
  }
});

io.use(socketAuth);

const chatSocket = require("./sockets/chat");
chatSocket(io);

app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
app.use('/',adminRoutes);

sequelize
  .sync()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  }).catch(err => console.error(err));

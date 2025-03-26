require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const sequelize = require("./utils/database");

const socketAuth = require("./middlewares/socketAuth");
const adminRoutes = require("./routes/admin");


const app = express();
app.use(express.static("uploads"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000/api",
    credentials: true
  }
});

io.use(socketAuth);

const chatSocket = require("./sockets/chat");
chatSocket(io);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use('/api',adminRoutes);

app.use(express.static(path.join(__dirname, 'public','pages')));
app.use('/scripts', express.static(path.join(__dirname, 'public','scripts')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'sign-in.html'));
});

sequelize
  .sync()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  }).catch(err => console.error(err));

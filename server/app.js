require('dotenv').config();
const path = require('path');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { createServer } = require('http'); 
const { Server } = require('socket.io');
const sequelize = require('./utils/database');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001', 
    credentials: true
  }
});

app.use(express.json());
app.use(cors({ 
  origin: 'http://localhost:3001',
  credentials: true 
}));

const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(adminRoutes);


const users = {};

sequelize
  .sync()
  .then(() => {
      server.listen(process.env.PORT, () => {
          console.log(`Server running on port ${process.env.PORT}`);
      });
  })
  .catch(err => {
      console.error(err);
  });

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("user-joined", (username) => {
        users[socket.id] = username;
        io.emit("user-joined", username);
    });

    socket.on("send-message", (data) => {
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        const username = users[socket.id]
        if (users[socket.id]) {
            io.emit("user-left", username);
            delete users[socket.id];
        }
    });
});

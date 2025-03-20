const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: "id"
    },
    onDelete: "CASCADE"
  }
}, {
  timestamps: false,
  tableName: "Chats"
});

module.exports = Chat;

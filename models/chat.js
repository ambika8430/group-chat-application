const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  group_id: { 
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Groups",
        key: "id"
      },
      onDelete: "CASCADE"
  },
  user_id: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    },
    onDelete: "CASCADE"
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
  }
}, {
  timestamps: false,
  tableName: "Chats"
});

module.exports = Chat;

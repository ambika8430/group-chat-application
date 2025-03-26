const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');

const Group = sequelize.define('Group', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  group_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  admin_id: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    },
    onDelete: "CASCADE"
  }
}, {
  timestamps: false,
  tableName: "Groups"
});

module.exports = Group;

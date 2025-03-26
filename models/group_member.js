const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  user_id: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: "id"
    },
    onDelete: "CASCADE"
  },
  group_id: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Groups',
      key: "id"
    },
    onDelete: "CASCADE"
  }
}, {
  timestamps: false,
  tableName: "GroupMembers"
});

module.exports = GroupMember;

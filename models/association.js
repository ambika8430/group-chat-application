const User = require('./user');
const Chat = require('./chat');
const Group = require('./group');
const GroupMember = require('./group_member');

User.hasMany(Chat, { foreignKey: "user_id" });
Chat.belongsTo(User, { foreignKey: "user_id" });

Group.hasMany(Chat, { foreignKey: "group_id" });
Chat.belongsTo(Group, { foreignKey: "group_id" });

User.hasMany(Group, { foreignKey: "admin_id" });
Group.belongsTo(User, { foreignKey: "admin_id" });

Group.hasMany(GroupMember, { foreignKey: "group_id" });
GroupMember.belongsTo(Group, { foreignKey: "group_id" });

GroupMember.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(GroupMember, { foreignKey: "user_id" });

module.exports = { User, Chat, Group, GroupMember }


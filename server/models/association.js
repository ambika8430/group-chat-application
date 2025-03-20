const User = require('./user');
const Chat = require('./chat');

Chat.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Chat, { foreignKey: "userId" });

module.exports = { User, Chat };

const User = require('./models/userModel');
const Friendship = require('./models/friendshipModel');
const Code = require('./models/codeModel');
const Presence = require('./models/presenceModel');

//User
User.hasMany(Friendship, { foreignKey: 'requesterId', as: 'requestedFriends' });
User.hasMany(Friendship, { foreignKey: 'receiverId', as: 'receivedFriends' });
User.hasMany(Code, { foreignKey: 'userId' });

//Friendship
Friendship.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

//Code
Code.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Presence
User.hasOne(Presence, { foreignKey: 'userId', as: 'presence' });
Presence.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Friendship, Code, Presence };
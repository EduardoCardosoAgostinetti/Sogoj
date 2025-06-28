const express = require('express');
require('dotenv').config();
const app = express();
const sequelize = require('../../config/db');

const users = require('./routes/userRoute');
const codes = require('./routes/codeRoute');
const friendships = require('./routes/friendshipRoute');
const presence = require('./routes/presenceRoute');

app.use(express.json());
app.use('/users', users);
app.use('/codes', codes);
app.use('/friendships', friendships);
app.use('/presence', presence);

function startHttpServer(port) {
  sequelize.sync({ force: true })
  .then(() => {
    console.log('Database synced successfully!');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error syncing the database:', err);
  });
}

module.exports = { startHttpServer };

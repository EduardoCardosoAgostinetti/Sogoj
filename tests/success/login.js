const axios = require('axios');
//require('dotenv').config({ path: '../../.env' });

const baseUrl = 'http://localhost:3000';

const users = [
    {
        username: 'admin1',
        nickname: 'Admin One',
        email: 'admin1@example.com',
        password: 'password123',
    },
    {
        username: 'mod2',
        nickname: 'Moderator Two',
        email: 'mod2@example.com',
        password: 'password123',
    },
    {
        username: 'user3',
        nickname: 'User Three',
        email: 'user3@example.com',
        password: 'password123',
    },
    {
        username: 'guest4',
        nickname: 'Guest Four',
        email: 'guest4@example.com',
        password: 'password123',
    },
];

(async () => {
    for (const user of users) {

        try {
            const loginRes = await axios.post(`${baseUrl}/users/login`, {
                username: user.username,
                password: user.password,
            });

            const { id, username } = loginRes.data.data.content.user;
            const token = loginRes.data.data.content.token;

            console.log(`✅ Login bem-sucedido: ${username}`);
            console.log(`   UUID: ${id}`);
            console.log(`   Token: ${token}`);
            console.log('---');
        } catch (loginErr) {
            console.error(`❌ Erro ao logar com ${user.email}:`, loginErr.response?.data || loginErr.message);
        }

    }
})();

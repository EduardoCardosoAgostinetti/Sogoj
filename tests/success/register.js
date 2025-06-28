const axios = require('axios');
//require('dotenv').config({ path: '../../.env' });

const baseUrl = 'http://localhost:3000';

const usersToRegister = [
    {
        username: 'admin1',
        nickname: 'Admin ONe',
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
    for (const user of usersToRegister) {
        try {
            const response = await axios.post(`${baseUrl}/users/register`, user);
            const { id, username, email } = response.data.data.content;

            console.log(`✅ Usuário registrado: ${username}`);
            console.log(`   ID: ${id}`);
            console.log(`   Email: ${email}`);
            console.log('---');
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.message === 'Email is already in use' || errData?.message === 'Username is already in use') {
                console.warn(`⚠️ Usuário já existe: ${user.email} (${user.username})`);
            } else {
                console.error(`❌ Erro ao registrar ${user.email}:`, errData || error.message);
            }
        }
    }
})();

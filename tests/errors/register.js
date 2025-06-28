const axios = require('axios');

const baseUrl = 'http://localhost:3000';

const testCases = [
    {
        description: '🟥 Todos os campos ausentes',
        payload: {},
    },
    {
        description: '🟥 Email inválido',
        payload: {
            username: 'userErro',
            nickname: 'User Erro',
            email: 'emailinvalido',
            password: 'password123',
        },
    },
    {
        description: '🟥 Senha muito curta',
        payload: {
            username: 'userErro2',
            nickname: 'User Erro 2',
            email: 'erro2@example.com',
            password: '123',
        },
    },
    {
        description: '🟥 Email já registrado',
        payload: {
            username: 'userNovo',
            nickname: 'User Novo',
            email: 'admin1@example.com', // já existe
            password: 'password123',
        },
    },
    {
        description: '🟥 Username já registrado',
        payload: {
            username: 'admin1', // já existe
            nickname: 'Novo Nick',
            email: 'novoemail@example.com',
            password: 'password123',
        },
    },
];

(async () => {
    for (const test of testCases) {
        try {
            console.log(`🔎 Testando: ${test.description}`);
            await axios.post(`${baseUrl}/users/register`, test.payload);
        } catch (err) {
            console.error(`❌ ${test.description}:`, err.response?.data || err.message);
            console.log('---');
        }
    }
})();

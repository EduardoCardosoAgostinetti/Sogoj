const axios = require('axios');

const baseUrl = 'http://localhost:3000';

const testCases = [
    {
        description: '🟥 Campos vazios',
        payload: {},
    },
    {
        description: '🟥 Username ausente',
        payload: { password: 'password123' },
    },
    {
        description: '🟥 Password ausente',
        payload: { username: 'admin1' },
    },
    {
        description: '🟥 Username incorreto',
        payload: { username: 'inexistente', password: 'password123' },
    },
    {
        description: '🟥 Senha incorreta',
        payload: { username: 'admin1', password: 'senhaErrada' },
    },
    {
        description: '🟥 Usuário já logado (com presença ativa)',
        payload: { username: 'admin1', password: 'password123' },
    },
];

(async () => {
    for (const test of testCases) {
        try {
            console.log(`🔎 Testando: ${test.description}`);
            await axios.post(`${baseUrl}/users/login`, test.payload);
        } catch (err) {
            console.error(`❌ ${test.description}:`, err.response?.data || err.message);
            console.log('---');
        }
    }
})();

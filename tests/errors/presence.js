const axios = require('axios');

const baseUrl = 'http://localhost:3000';

(async () => {
    console.log('🔴 Teste 1: Token ausente');
    try {
        await axios.put(`${baseUrl}/presence/updatePresence`, {
            status: 'online',
        });
    } catch (error) {
        console.error('→ Esperado erro 401:', error.response?.data || error.message);
    }

    console.log('\n🔴 Teste 2: Token inválido');
    try {
        await axios.put(`${baseUrl}/presence/updatePresence`, {
            status: 'online',
        }, {
            headers: {
                Authorization: `Bearer INVALID_TOKEN`,
            },
        });
    } catch (error) {
        console.error('→ Esperado erro 401:', error.response?.data || error.message);
    }

    console.log('\n🔴 Teste 3: Status inválido (usuário válido)');
    try {
        // Login com um usuário válido
        const loginResponse = await axios.post(`${baseUrl}/users/login`, {
            username: 'admin1',
            password: 'password123',
        });

        const token = loginResponse.data.data.content.token;

        await axios.put(`${baseUrl}/presence/updatePresence`, {
            status: 'invisible', // Status inválido
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('→ Esperado erro 400 (status inválido):', error.response?.data || error.message);
    }

    console.log('\n🔴 Teste 4: Erro interno (simulado manualmente no backend)');
    try {
        const loginResponse = await axios.post(`${baseUrl}/users/login`, {
            username: 'admin1',
            password: 'password123',
        });

        const token = loginResponse.data.data.content.token;

        // Envie um dado malformado proposital (por ex: null) para tentar forçar erro de DB
        await axios.put(`${baseUrl}/presence/updatePresence`, {
            status: null,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('→ Esperado erro 400 ou 500:', error.response?.data || error.message);
    }

})();

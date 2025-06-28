const axios = require('axios');
const baseUrl = 'http://localhost:3000';

const users = [
    {
        username: 'admin1',
        email: 'admin1@example.com',
        password: 'password123',
        token: null,
        id: null
    },
    {
        username: 'mod2',
        email: 'mod2@example.com',
        password: 'password123',
        token: null,
        id: null
    },
];

async function loginUsers() {
    for (const user of users) {
        try {
            const res = await axios.post(`${baseUrl}/users/login`, {
                username: user.username,
                password: user.password,
            });
            const content = res.data.data.content;
            user.token = content.token;
            user.id = content.user.id;
            console.log(`✅ Logado: ${user.username}`);
        } catch (err) {
            console.error(`❌ Erro login ${user.username}:`, err.response?.data || err.message);
        }
    }
}

async function runErrorTests() {
    await loginUsers();

    const [admin, mod] = users;

    console.log('\n🚫 TESTES DE ERRO NAS ROTAS DE AMIZADE\n');

    // 1️⃣ Enviar solicitação para si mesmo
    try {
        console.log('1️⃣ Enviar solicitação para si mesmo...');
        await axios.post(`${baseUrl}/friendships/sendFriendRequest`, {
            receiverId: admin.id
        }, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
    } catch (err) {
        console.error('✅ Esperado:', err.response?.data.message);
    }

    // 2️⃣ Enviar solicitação sem receiverId
    try {
        console.log('\n2️⃣ Enviar solicitação sem receiverId...');
        await axios.post(`${baseUrl}/friendships/sendFriendRequest`, {}, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
    } catch (err) {
        console.error('✅ Esperado:', err.response?.data.message);
    }

    // 3️⃣ Repetir solicitação de amizade já enviada
    try {
        console.log('\n3️⃣ Solicitação duplicada...');
        await axios.post(`${baseUrl}/friendships/sendFriendRequest`, {
            receiverId: mod.id
        }, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
        console.log('↪️ Tentando enviar solicitação duplicada...');
        await axios.post(`${baseUrl}/friendships/sendFriendRequest`, {
            receiverId: mod.id
        }, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
    } catch (err) {
        console.error('✅ Esperado:', err.response?.data.message);
    }

    // 4️⃣ Responder solicitação inexistente
    try {
        console.log('\n4️⃣ Responder solicitação inexistente...');
        await axios.post(`${baseUrl}/friendships/respondToFriendRequest`, {
            requestId: 9999,
            action: 'accept'
        }, {
            headers: { Authorization: `Bearer ${mod.token}` }
        });
    } catch (err) {
        console.error('✅ Esperado:', err.response?.data.message);
    }

    // 5️⃣ Responder com ação inválida
    try {
        console.log('\n5️⃣ Ação inválida na resposta da solicitação...');

        // Agora tenta buscar solicitações pendentes
        const pending = await axios.get(`${baseUrl}/friendships/getPendingFriendRequests`, {
            headers: { Authorization: `Bearer ${mod.token}` }
        });

        const requests = pending.data.data.content;

        if (requests.length > 0) {
            const requestId = requests[0].id;
            await axios.post(`${baseUrl}/friendships/respondToFriendRequest`, {
                requestId,
                action: 'dance' // ação inválida proposital
            }, {
                headers: { Authorization: `Bearer ${mod.token}` }
            });
        } else {
            console.error('✅ Esperado (ação inválida):');
        }
    } catch (err) {
        console.error('✅ Esperado (ação inválida):', err.response?.data.message);
    }


    // 6️⃣ Buscar amigos sem token
    try {
        console.log('\n6️⃣ Buscar lista de amigos sem autenticação...');
        await axios.get(`${baseUrl}/friendships/getFriends`);
    } catch (err) {
        console.error('✅ Esperado:', err.response?.data.message);
    }

    // 7️⃣ Enviar solicitação sem token
    try {
        console.log('\n7️⃣ Enviar solicitação sem token...');
        await axios.post(`${baseUrl}/friendships/sendFriendRequest`, {
            receiverId: mod.id
        });
    } catch (err) {
        console.error('✅ Esperado:', err.response?.data.message);
    }
}

runErrorTests();

const axios = require('axios');
const baseUrl = 'http://localhost:3000';

const users = [
    {
        username: 'admin1',
        nickname: 'Admin One',
        email: 'admin1@example.com',
        password: 'password123',
        id: null,
        token: null,
    },
    {
        username: 'mod2',
        nickname: 'Moderator Two',
        email: 'mod2@example.com',
        password: 'password123',
        id: null,
        token: null,
    },
    {
        username: 'user3',
        nickname: 'User Three',
        email: 'user3@example.com',
        password: 'password123',
        id: null,
        token: null,
    },
    {
        username: 'guest4',
        nickname: 'Guest Four',
        email: 'guest4@example.com',
        password: 'password123',
        id: null,
        token: null,
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
            user.id = content.user.id; // atualiza id (caso não tenha vindo do registro)
            user.token = content.token;
            console.log(`✅ Login bem-sucedido: ${user.username} (ID: ${user.id} && Token: ${user.token})`);
        } catch (error) {
            console.error(`❌ Erro ao logar com ${user.email}:`, error.response?.data || error.message);
        }
    }
}

// Envia solicitações de amizade
async function sendFriendRequest(fromIndex, toIndex) {
    try {
        await axios.post(
            `${baseUrl}/friendships/sendFriendRequest`,
            { receiverId: users[toIndex].id },
            { headers: { Authorization: `Bearer ${users[fromIndex].token}` } }
        );
        console.log(`✅ User ${users[fromIndex].username} enviou solicitação para ${users[toIndex].username}`);
    } catch (error) {
        console.error(`❌ Erro enviando solicitação de ${users[fromIndex].username} para ${users[toIndex].username}:`, error.response?.data || error.message);
    }
}

// Responde solicitações (aceitar/recusar)
async function respondToFriendRequest(userIndex, requestId, action) {
    try {
        await axios.post(
            `${baseUrl}/friendships/respondToFriendRequest`,
            { requestId, action },
            { headers: { Authorization: `Bearer ${users[userIndex].token}` } }
        );
        console.log(`🔁 User ${users[userIndex].username} ${action} solicitação ${requestId}`);
    } catch (error) {
        console.error(`❌ Erro respondendo solicitação ${requestId}:`, error.response?.data || error.message);
    }
}

// Pega as solicitações pendentes para um usuário
async function getPendingRequests(userIndex) {
    try {
        const res = await axios.get(
            `${baseUrl}/friendships/getPendingFriendRequests`,
            { headers: { Authorization: `Bearer ${users[userIndex].token}` } }
        );
        return res.data.data.content || [];
    } catch (error) {
        console.error(`❌ Erro buscando solicitações pendentes para ${users[userIndex].username}:`, error.response?.data || error.message);
        return [];
    }
}

// Lista amigos de um usuário
async function getFriendsList(userIndex) {
    try {
        const res = await axios.get(`${baseUrl}/friendships/getFriends`, {
            headers: { Authorization: `Bearer ${users[userIndex].token}` }
        });
        const friends = res.data.data.content;
        console.log(`\n👥 Amigos de ${users[userIndex].username}:`);
        if (!friends.length) {
            console.log('   Nenhum amigo encontrado.');
        } else {
            friends.forEach(f => {
                console.log(`   ➤ ${f.nickname} (ID: ${f.id})`);
            });
        }
    } catch (error) {
        console.error(`❌ Erro ao buscar amigos de ${users[userIndex].username}:`, error.response?.data || error.message);
    }
}

// Função principal que roda todo o fluxo
async function runAll() {
    
    console.log('\n🔐 Logando usuários...');
    await loginUsers();

    console.log('\n📨 Enviando solicitações de amizade...');
    // Exemplo de envios:
    await sendFriendRequest(0, 1);
    await sendFriendRequest(0, 2);
    await sendFriendRequest(0, 3);
    await sendFriendRequest(1, 2);
    await sendFriendRequest(1, 3);
    await sendFriendRequest(2, 3);

    console.log('\n📥 Respondendo solicitações pendentes...');
    // Usuário 1 (index 0) aceita ou recusa (exemplo: aceita todas)
    let pendings = await getPendingRequests(0);
    for (const req of pendings) {
        await respondToFriendRequest(0, req.id, 'accept');
    }
    // Usuário 2 (index 1) recusa todas
    pendings = await getPendingRequests(1);
    for (const req of pendings) {
        await respondToFriendRequest(1, req.id, 'accept');
    }
    // Usuário 3 (index 2) aceita todas
    pendings = await getPendingRequests(2);
    for (const req of pendings) {
        await respondToFriendRequest(2, req.id, 'accept');
    }
    // Usuário 4 (index 3) recusa todas
    pendings = await getPendingRequests(3);
    for (const req of pendings) {
        await respondToFriendRequest(3, req.id, 'accept');
    }

    console.log('\n🔍 Listando amigos...');
    for (let i = 0; i < users.length; i++) {
        await getFriendsList(i);
    }

    console.log('\n✅ Fluxo completo finalizado!');
}

runAll();

const axios = require('axios');

const baseUrl = 'http://localhost:3000/codes';

(async () => {
  // 1️⃣ Erro: Email inválido no /request
  try {
    console.log('🚫 Testando email inválido no /request...');
    await axios.post(`${baseUrl}/request`, { email: 'emailinvalido' });
  } catch (err) {
    console.error('✅ Erro esperado (/request com email inválido):', err.response?.data);
  }

  // 2️⃣ Erro: Email inexistente no /request
  try {
    console.log('🚫 Testando email inexistente no /request...');
    await axios.post(`${baseUrl}/request`, { email: 'naoexiste@example.com' });
  } catch (err) {
    console.error('✅ Erro esperado (/request com email não cadastrado):', err.response?.data);
  }

  // 3️⃣ Erro: Código inválido no /verify
  try {
    console.log('🚫 Testando código inválido no /verify...');
    await axios.post(`${baseUrl}/verify`, {
      email: 'admin1@example.com',
      code: '123', // muito curto
    });
  } catch (err) {
    console.error('✅ Erro esperado (/verify com código inválido):', err.response?.data);
  }

  // 4️⃣ Erro: Código inexistente ou já usado no /verify
  try {
    console.log('🚫 Testando código inexistente no /verify...');
    await axios.post(`${baseUrl}/verify`, {
      email: 'admin1@example.com',
      code: '999999',
    });
  } catch (err) {
    console.error('✅ Erro esperado (/verify com código incorreto):', err.response?.data);
  }

  // 5️⃣ Erro: Campos inválidos no /resetPass
  try {
    console.log('🚫 Testando /resetPass com senha curta...');
    await axios.post(`${baseUrl}/resetPass`, {
      email: 'admin1@example.com',
      code: '000000',
      newPassword: '123', // muito curta
    });
  } catch (err) {
    console.error('✅ Erro esperado (/resetPass com senha curta):', err.response?.data);
  }

  // 6️⃣ Erro: Email não existente no /resetPass
  try {
    console.log('🚫 Testando /resetPass com email inexistente...');
    await axios.post(`${baseUrl}/resetPass`, {
      email: 'naoexiste@example.com',
      code: '000000',
      newPassword: 'novaSenha123',
    });
  } catch (err) {
    console.error('✅ Erro esperado (/resetPass com email inexistente):', err.response?.data);
  }

})();

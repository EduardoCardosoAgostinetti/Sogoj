const { startHttpServer } = require('./src/http/serverHttp');
const { startWebSocketServer } = require('./src/websocket/serverWS');

async function startServers() {
  await Promise.all([
    startHttpServer(3000),
    startWebSocketServer(8080)
  ]);
  console.log('Ambos os servidores estão rodando!');
}

startServers().catch(err => {
  console.error('Erro ao iniciar servidores:', err);
});

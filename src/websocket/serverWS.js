const WebSocket = require('ws');

function startWebSocketServer(port = 8080) {
  return new Promise((resolve) => {
    const wss = new WebSocket.Server({ port });
    wss.on('listening', () => {
      console.log(`WebSocket server running on port ${port}`);
      resolve();
    });
  });
}

module.exports = { startWebSocketServer };

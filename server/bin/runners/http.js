import http from 'http';

import server from '../../server.js';

export default function startServer() {
  const httpServer = http.createServer(server);
  const PORT = process.env.PORT;

  httpServer.listen(PORT, () => {
    console.log('==============================='.green);
    console.log('🚀 SERVER STARTED:'.bold + ' HTTP server is running'.green);
    console.log('🌐 URL:'.bold + ` http://localhost:${PORT}`.cyan);
    console.log('==============================='.green);
  });

  httpServer.on('error', err => {
    console.log('==============================='.red);
    console.log('❌ SERVER ERROR:'.bold + ' Failed to start HTTP server'.red);
    console.log(`📄 ${err.message}`.yellow);
    console.log('==============================='.red);
  });
}

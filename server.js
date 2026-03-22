const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const LOG_FILE = path.join(__dirname, 'midiwave.log');

// Clear log on startup
fs.writeFileSync(LOG_FILE, `[midiwave] Server started ${new Date().toISOString()}\n`);

function fileLog(line) {
  fs.appendFileSync(LOG_FILE, line + '\n');
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const entries = parsed.batch || [parsed];
        for (const { level, args } of entries) {
          const tag = { log: ' LOG', warn: 'WARN', error: ' ERR', info: 'INFO' }[level] || ' LOG';
          const colorTag = { log: '\x1b[36m LOG\x1b[0m', warn: '\x1b[33mWARN\x1b[0m', error: '\x1b[31m ERR\x1b[0m', info: '\x1b[34mINFO\x1b[0m' }[level] || ' LOG';
          const ts = new Date().toTimeString().slice(0, 8);
          const msg = args.join(' ');
          console.log(`${ts} ${colorTag}  ${msg}`);
          fileLog(`${ts} ${tag}  ${msg}`);
        }
      } catch {}
      res.writeHead(200);
      res.end();
    });
    return;
  }

  // Re-read index.html on each request for live editing
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
});

server.listen(PORT, () => {
  console.log(`\x1b[36m[midiwave]\x1b[0m http://localhost:${PORT}`);
  console.log(`\x1b[36m[midiwave]\x1b[0m Logs → ${LOG_FILE}\n`);
  fileLog(`[midiwave] Listening on http://localhost:${PORT}`);
});

#!/usr/bin/env node

/**
 * Quick Benchmark Test
 * Tests if servers start and can handle basic requests
 */

const { spawn } = require('child_process');
const http = require('http');

const SERVERS = [
  { name: 'Flash', script: 'benchmarks/servers/flash-server.js', port: 5627 },
  { name: 'Express', script: 'benchmarks/servers/express-server.js', port: 5629 },
];

async function testServer(config) {
  console.log(`\n🧪 Testing ${config.name}...`);
  
  return new Promise((resolve, reject) => {
    // Start server
    const server = spawn('node', [config.script], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        server.kill();
        reject(new Error(`${config.name} timeout`));
      }
    }, 5000);

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`  ${config.name}: ${output.trim()}`);
      
      if (output.includes('listening') || output.includes('started')) {
        started = true;
        clearTimeout(timeout);

        // Test request
        setTimeout(() => {
          http.get(`http://localhost:${config.port}/hello`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              console.log(`  ✅ ${config.name} response: ${data}`);
              server.kill();
              resolve();
            });
          }).on('error', (err) => {
            console.error(`  ❌ ${config.name} error: ${err.message}`);
            server.kill();
            reject(err);
          });
        }, 500);
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`  ❌ ${config.name} error: ${data.toString()}`);
    });

    server.on('close', () => {
      if (!started) {
        reject(new Error(`${config.name} exited early`));
      }
    });
  });
}

async function main() {
  console.log('🚀 Quick Server Test\n');
  
  for (const server of SERVERS) {
    try {
      await testServer(server);
    } catch (error) {
      console.error(`\n❌ ${server.name} failed:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All servers working!\n');
}

main();

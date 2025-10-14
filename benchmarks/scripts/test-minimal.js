#!/usr/bin/env node

// Minimal test to isolate the segfault

console.log('[Test] Step 1: Loading native module...');
try {
    const native = require('../../dist/src/native');
    console.log('[Test] Step 2: Module loaded, keys:', Object.keys(native));
    
    console.log('[Test] Step 3: Creating Server instance...');
    const { Server } = native;
    const server = new Server(5627);
    
    console.log('[Test] Step 4: Server created!');
    console.log('[Test] Step 5: Port:', server.getPort());
    console.log('[Test] Step 6: Is running?', server.isRunning());
    
    console.log('[Test] ✅ All basic operations work!');
    process.exit(0);
    
} catch (error) {
    console.error('[Test] ❌ Error:', error);
    process.exit(1);
}

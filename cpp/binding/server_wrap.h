#pragma once
#include <napi.h>
#include <memory>
#include "../include/server.h"
#include "server_async_worker.h"

namespace flash {
namespace binding {

// =============================================================================
// WEEK 6, DAY 8: OBJECTWRAP PATTERN
// =============================================================================
// LEARNING OBJECTIVE: Understand how to expose C++ classes to JavaScript
//
// ObjectWrap is a N-API pattern that:
// 1. Wraps a C++ class so JavaScript can use it
// 2. Manages the C++ object lifetime (created when JS creates instance, destroyed when GC collects)
// 3. Exposes C++ methods as JavaScript methods
//
// JAVASCRIPT SIDE:
//   const server = new Flash.Server(5627);  // Calls C++ constructor
//   server.start();                         // Calls C++ Start() method
//   const port = server.getPort();          // Calls C++ GetPort() method
//   server.stop();                          // Calls C++ Stop() method
//   // When server goes out of scope, C++ destructor is called
//
// C++ SIDE:
//   ServerWrap wraps HttpServer
//   JavaScript operations → ServerWrap methods → HttpServer methods

// =============================================================================
// TODO 6.8.1: Create ServerWrap class inheriting from ObjectWrap
// =============================================================================
// WHAT: ObjectWrap<ServerWrap> is the base class for wrapping C++ objects
// WHY: It handles the C++/JavaScript object binding automatically
//
// HINT 1: Inherit from Napi::ObjectWrap<ServerWrap>
// HINT 2: The template parameter is your class name (CRTP pattern)
// HINT 3: ObjectWrap provides lifecycle management
//
class ServerWrap : public Napi::ObjectWrap<ServerWrap> {
public:
    // =========================================================================
    // TODO 6.8.2: Declare static Init() method
    // =========================================================================
    // WHAT: Registers the class with JavaScript so it can be instantiated
    // WHY: JavaScript needs to know about the class before using it
    //
    // HINT 1: This is called once when the addon loads
    // HINT 2: It creates the constructor function and registers methods
    // HINT 3: Returns a Napi::Object that JavaScript will use as the constructor
    //
    // USAGE: Called from addon.cpp:
    //   ServerWrap::Init(env, exports);
    //
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    
    // =========================================================================
    // TODO 6.8.3: Declare constructor
    // =========================================================================
    // WHAT: C++ constructor called when JavaScript does: new Flash.Server(port)
    // WHY: Creates the wrapped HttpServer instance
    //
    // HINT 1: Takes Napi::CallbackInfo which contains JavaScript arguments
    // HINT 2: info[0] will be the port number from JavaScript
    // HINT 3: Must call parent constructor: ObjectWrap(info)
    // HINT 4: Create HttpServer instance and store in server_
    //
    // JAVASCRIPT USAGE:
    //   const server = new Flash.Server(5627);  // Calls this constructor
    //
    ServerWrap(const Napi::CallbackInfo& info);

private:
    // =========================================================================
    // TODO 6.8.4: Declare JavaScript-callable methods (Instance Methods)
    // =========================================================================
    // WHAT: These are methods that JavaScript can call on server instances
    // WHY: Expose C++ functionality to JavaScript
    //
    // PATTERN: All methods follow same signature:
    //   Napi::Value MethodName(const Napi::CallbackInfo& info)
    //
    // JAVASCRIPT USAGE:
    //   server.start();        // Calls Start()
    //   server.stop();         // Calls Stop()
    //   const running = server.isRunning();  // Calls IsRunning()
    //   const port = server.getPort();       // Calls GetPort()
    
    // =========================================================================
    // TODO 6.12.1: Start() - Start the HTTP server
    // =========================================================================
    // WHAT: Starts the C++ HTTP server (listens on port)
    // WHY: JavaScript needs to start the server
    //
    // HINT 1: Call server_->start() to start C++ server
    // HINT 2: WARNING: This will BLOCK! We'll fix this in Week 7 with AsyncWorker
    // HINT 3: Catch exceptions and convert to JavaScript errors
    // HINT 4: Return undefined: return env.Undefined()
    //
    // JAVASCRIPT USAGE:
    //   await server.start();  // Starts server (currently blocks!)
    //
    Napi::Value Start(const Napi::CallbackInfo& info);
    
    // =========================================================================
    // TODO 6.12.2: Stop() - Stop the HTTP server
    // =========================================================================
    // WHAT: Stops the C++ HTTP server gracefully
    // WHY: JavaScript needs to stop the server
    //
    // HINT 1: Call server_->stop() to stop C++ server
    // HINT 2: Close socket and cleanup resources
    // HINT 3: Return undefined
    //
    // JAVASCRIPT USAGE:
    //   server.stop();  // Stops server
    //
    Napi::Value Stop(const Napi::CallbackInfo& info);
    
    // =========================================================================
    // TODO 6.12.3: IsRunning() - Check if server is running
    // =========================================================================
    // WHAT: Returns whether the server is currently running
    // WHY: JavaScript needs to check server status
    //
    // HINT 1: Call server_->is_running() to get status
    // HINT 2: Return boolean: Napi::Boolean::New(env, is_running)
    //
    // JAVASCRIPT USAGE:
    //   if (server.isRunning()) {
    //       console.log('Server is running');
    //   }
    //
    Napi::Value IsRunning(const Napi::CallbackInfo& info);
    
    // =========================================================================
    // TODO 6.12.4: GetPort() - Get server port number
    // =========================================================================
    // WHAT: Returns the port number the server is listening on
    // WHY: JavaScript needs to know what port is being used
    //
    // HINT 1: Call server_->get_port() to get port
    // HINT 2: Return number: Napi::Number::New(env, port)
    //
    // JAVASCRIPT USAGE:
    //   const port = server.getPort();  // Returns 5627
    //   console.log(`Server listening on port ${port}`);
    //
    Napi::Value GetPort(const Napi::CallbackInfo& info);
    
    // =========================================================================
    // TODO 6.8.5: Store the C++ HttpServer instance
    // =========================================================================
    // WHAT: The actual C++ server that does the work
    // WHY: ServerWrap is just a wrapper, HttpServer does the real work
    //
    // HINT 1: Use std::unique_ptr for automatic memory management
    // HINT 2: Created in constructor: server_ = std::make_unique<HttpServer>(port)
    // HINT 3: Automatically destroyed when ServerWrap is destroyed (RAII)
    //
    std::unique_ptr<HttpServer> server_;
    
    // =========================================================================
    // PHASE 5: AsyncWorker for non-blocking server
    // =========================================================================
    // WHAT: Keeps the async worker alive while server is running
    // WHY: Worker must exist until background thread completes
    //
    // NOTE: Raw pointer is OK here because AsyncWorker manages its own lifetime.
    //       It deletes itself when the work is complete.
    //
    ServerAsyncWorker* async_worker_ = nullptr;
    
    // =========================================================================
    // TODO 6.8.6: Store route handlers (Week 7 - Advanced)
    // =========================================================================
    // WHAT: JavaScript functions that handle HTTP requests
    // WHY: JavaScript will register handlers: server.get('/path', handler)
    //
    // HINT 1: JavaScript passes functions as callbacks
    // HINT 2: Store them to call when requests arrive
    // HINT 3: We'll implement this in Week 7
    //
    // STRUCTURE:
    //   Key: "GET /api/users"
    //   Value: JavaScript function to call
    //
    // NOTE: Leave this commented out for now - we'll use it in Week 7
    // std::map<std::string, Napi::FunctionReference> route_handlers_;
};

} // namespace binding
} // namespace flash
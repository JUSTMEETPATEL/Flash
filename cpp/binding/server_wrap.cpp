#include "server_wrap.h"
#include "type_converter.h"
#include <iostream>

namespace flash {
namespace binding {

// =============================================================================
// WEEK 6, DAY 11: IMPLEMENTING OBJECTWRAP
// =============================================================================

// =============================================================================
// TODO 6.11.1: Implement Init() - Register class with JavaScript
// =============================================================================
// WHAT: This registers the ServerWrap class so JavaScript can use it
// WHY: N-API needs to know about the class before JavaScript can create instances
//
// STEP 1: Define the class with DefineClass()
//   Napi::Function func = DefineClass(env, "Server", {
//       // Methods go here
//   });
//
// STEP 2: Register instance methods inside DefineClass
//   InstanceMethod("start", &ServerWrap::Start),
//   InstanceMethod("stop", &ServerWrap::Stop),
//   InstanceMethod("isRunning", &ServerWrap::IsRunning),
//   InstanceMethod("getPort", &ServerWrap::GetPort)
//
// STEP 3: Export the constructor so JavaScript can use it
//   exports.Set("Server", func);
//   return exports;
//
// COMPLETE FUNCTION:
Napi::Object ServerWrap::Init(Napi::Env env, Napi::Object exports) {
    // Define the Server class with its instance methods
    Napi::Function func = DefineClass(env, "Server", {
        InstanceMethod("start", &ServerWrap::Start),
        InstanceMethod("stop", &ServerWrap::Stop),
        InstanceMethod("isRunning", &ServerWrap::IsRunning),
        InstanceMethod("getPort", &ServerWrap::GetPort)
    });
    
    // Export the constructor so JavaScript can use it
    exports.Set("Server", func);
    
    std::cout << "[ServerWrap] Server class registered!" << std::endl;
    
    return exports;
}

// =============================================================================
// TODO 6.11.5: Implement Constructor
// =============================================================================
// WHAT: Creates a new ServerWrap instance when JavaScript does: new Flash.Server(port)
// WHY: We need to create the C++ HttpServer with the provided port
//
// STEP 1: Call parent constructor
//   Already done: : Napi::ObjectWrap<ServerWrap>(info)
//
// STEP 2: Validate arguments
//   Check: info.Length() >= 1
//   Check: info[0].IsNumber()
//   If invalid: throw Napi::TypeError::New(env, "Expected port number")
//
// STEP 3: Extract port number
//   int port = info[0].As<Napi::Number>().Int32Value();
//
// STEP 4: Validate port range
//   if (port < 1 || port > 65535) {
//       throw Napi::RangeError::New(env, "Port must be between 1 and 65535");
//   }
//
// STEP 5: Create HttpServer instance
//   server_ = std::make_unique<HttpServer>(port, 4);  // port, worker count
//
// COMPLETE CONSTRUCTOR:
ServerWrap::ServerWrap(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<ServerWrap>(info) {
    Napi::Env env = info.Env();
    
    std::cout << "[ServerWrap] Constructor called" << std::endl;
    
    // Validate arguments
    if (info.Length() < 1) {
        throw Napi::TypeError::New(env, "Expected 1 argument: port number");
    }
    
    std::cout << "[ServerWrap] Argument count OK" << std::endl;
    
    if (!info[0].IsNumber()) {
        throw Napi::TypeError::New(env, "Argument must be a number");
    }
    
    std::cout << "[ServerWrap] Argument is number" << std::endl;
    
    // Extract port number
    int port = info[0].As<Napi::Number>().Int32Value();
    
    std::cout << "[ServerWrap] Port extracted: " << port << std::endl;
    
    // Validate port range
    if (port < 1 || port > 65535) {
        throw Napi::RangeError::New(env, "Port must be between 1 and 65535");
    }
    
    std::cout << "[ServerWrap] Port validation passed" << std::endl;
    std::cout << "[ServerWrap] About to create HttpServer..." << std::endl;
    
    // Create HttpServer instance
    server_ = std::make_unique<HttpServer>(port);
    
    std::cout << "[ServerWrap] Server created on port " << port << std::endl;
}

// =============================================================================
// WEEK 6, DAY 12: IMPLEMENTING METHODS
// =============================================================================

// =============================================================================
// TODO 6.12.1: Implement Start() method
// =============================================================================
// WHAT: Starts the HTTP server
// WHY: JavaScript calls this to start listening for connections
//
// PHASE 5 UPDATE: Now uses AsyncWorker for non-blocking operation!
//
// OLD APPROACH (Week 6):
//   server_->start();  // This BLOCKS the event loop!
//
// NEW APPROACH (Phase 5):
//   Create AsyncWorker that runs server_->start() in background thread
//   Main thread remains free to handle other events
//
// HOW IT WORKS:
// 1. Check if server is already running
// 2. Create ServerAsyncWorker with server pointer
// 3. Queue() starts the worker in a background thread
// 4. Worker calls server_->start() (blocking is OK - it's on worker thread!)
// 5. Return immediately to JavaScript (non-blocking!)
//
// COMPLETE FUNCTION:
Napi::Value ServerWrap::Start(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // Check if server is already running
    if (server_->is_running()) {
        Napi::Error::New(env, "Server is already running")
            .ThrowAsJavaScriptException();
        return env.Null();
    }
    
    try {
        // Create AsyncWorker to run server in background thread
        // Note: AsyncWorker deletes itself when work is complete
        async_worker_ = new ServerAsyncWorker(env, server_.get());
        
        // Queue the worker - this starts it in a background thread
        async_worker_->Queue();
        
        std::cout << "[ServerWrap] Server starting in background thread..." << std::endl;
        
        // Return immediately - server runs in background!
        return env.Undefined();
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// =============================================================================
// TODO 6.12.2: Implement Stop() method
// =============================================================================
// WHAT: Stops the HTTP server
// WHY: JavaScript calls this to stop listening and cleanup
//
// STEP 1: Get environment
//   Napi::Env env = info.Env();
//
// STEP 2: Stop the server
//   try {
//       server_->stop();
//       std::cout<< "[ServerWrap] Server stopped successfully!" << std::endl;
//       return env.Undefined();
//   }
//   catch (const std::exception& e) {
//       Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
//       return env.Null();
//   }
//
// STEP 3: Return undefined
//   return env.Undefined();
//
// COMPLETE FUNCTION:
Napi::Value ServerWrap::Stop(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        server_->stop();
        std::cout << "[ServerWrap] Server stopped successfully!" << std::endl;
        return env.Undefined();
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// =============================================================================
// TODO 6.12.3: Implement IsRunning() method
// =============================================================================
// WHAT: Returns whether server is running
// WHY: JavaScript needs to check server status
//
// STEP 1: Get environment
//   Napi::Env env = info.Env();
//
// STEP 2: Check if server is running
//   bool is_running = server_->is_running();
//
// STEP 3: Return boolean
//   return Napi::Boolean::New(env, is_running);
//
// COMPLETE FUNCTION:
Napi::Value ServerWrap::IsRunning(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    bool is_running = server_->is_running();
    return Napi::Boolean::New(env, is_running);
}

// =============================================================================
// TODO 6.12.4: Implement GetPort() method
// =============================================================================
// WHAT: Returns the port number
// WHY: JavaScript needs to know what port server is using
//
// STEP 1: Get environment
//   Napi::Env env = info.Env();
//
// STEP 2: Get port from server
//   int port = server_->get_port();
//
// STEP 3: Return number
//   return Napi::Number::New(env, port);
//
// COMPLETE FUNCTION:
Napi::Value ServerWrap::GetPort(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    uint16_t port = server_->get_port();
    return Napi::Number::New(env, port);
}

}  // namespace binding
} //namespace flash
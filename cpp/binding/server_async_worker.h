#pragma once
#include <napi.h>
#include <memory>
#include <atomic>
#include "../include/server.h"

namespace flash {
namespace binding {

// =============================================================================
// WEEK 7 (PHASE 5): ASYNCWORKER PATTERN
// =============================================================================
// LEARNING OBJECTIVE: Make server non-blocking using AsyncWorker
//
// Problem: HttpServer::start() blocks indefinitely in accept() loop
// Solution: Run the blocking loop in a background thread using AsyncWorker
//
// AsyncWorker Benefits:
// 1. Runs blocking code in background thread (doesn't block event loop)
// 2. Automatically handles thread safety
// 3. Can communicate back to JavaScript via callbacks/promises
// 4. Properly manages lifecycle and cleanup
//
// How It Works:
// 1. JavaScript calls server.start()
// 2. ServerWrap::Start() creates ServerAsyncWorker
// 3. AsyncWorker::Execute() runs in background thread (server_->start() blocks here - OK!)
// 4. Main thread remains free to handle other events
// 5. When server stops, AsyncWorker::OnOK() is called on main thread

/**
 * @class ServerAsyncWorker
 * @brief AsyncWorker that runs the blocking server in a background thread
 * 
 * This worker allows the HTTP server's blocking accept() loop to run in
 * a background thread without blocking the Node.js event loop.
 * 
 * Lifecycle:
 * 1. Constructor: Store server reference, set up callback
 * 2. Execute(): Runs in background thread - calls server_->start()
 * 3. OnOK(): Called on main thread when Execute() completes successfully
 * 4. OnError(): Called on main thread if Execute() throws
 * 
 * Thread Safety:
 * - Execute() runs on worker thread (blocking OK)
 * - OnOK()/OnError() run on main thread (can safely call JavaScript)
 * - server_ pointer shared between threads (safe - HttpServer is thread-safe)
 */
class ServerAsyncWorker : public Napi::AsyncWorker {
public:
    /**
     * @brief Construct a new Server Async Worker
     * 
     * @param env Napi environment
     * @param server Pointer to HttpServer (not owned - ServerWrap owns it)
     */
    ServerAsyncWorker(Napi::Env env, HttpServer* server)
        : Napi::AsyncWorker(env), server_(server) {}
    
    /**
     * @brief Destructor
     */
    virtual ~ServerAsyncWorker() = default;

protected:
    /**
     * @brief Execute the async work (runs in background thread)
     * 
     * This method runs in a worker thread, so it's safe to block here.
     * The server's accept() loop will run until server_->stop() is called.
     * 
     * Thread: Worker thread (NOT main thread)
     * Blocking: OK to block here!
     * 
     * @throws std::exception on server error (caught by OnError)
     */
    void Execute() override {
        try {
            // This blocks in the accept() loop - but we're on a worker thread,
            // so it won't block the Node.js event loop!
            server_->start();
        } catch (const std::exception& e) {
            // Set error - OnError() will be called on main thread
            SetError(e.what());
        }
    }
    
    /**
     * @brief Called on main thread when Execute() completes successfully
     * 
     * Thread: Main thread (event loop)
     * Use: Can safely call JavaScript code here
     */
    void OnOK() override {
        // Server has stopped cleanly
        // Could resolve a promise or call a callback here
        // For now, we just let it complete silently
    }
    
    /**
     * @brief Called on main thread if Execute() threw an exception
     * 
     * Thread: Main thread (event loop)
     * Use: Report errors back to JavaScript
     * 
     * @param error The error from Execute()
     */
    void OnError(const Napi::Error& error) override {
        // Error occurred in server
        // The error is already set by SetError() in Execute()
        // Base class handles the error reporting
        error.ThrowAsJavaScriptException();
    }

private:
    HttpServer* server_;  ///< Pointer to server (not owned)
};

} // namespace binding
} // namespace flash

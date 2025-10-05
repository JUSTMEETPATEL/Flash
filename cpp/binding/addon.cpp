#include <napi.h>
#include <iostream>
#include "server_wrap.h"

using namespace flash::binding;

// =============================================================================
// WEEK 5, DAY 5: ADDON INITIALIZATION
// =============================================================================
// LEARNING OBJECTIVE: Understand how Node.js native addons are initialized
//
// This file is the entry point for the N-API addon
// When Node.js loads the addon with require(), this Init() function is called
// It registers all C++ classes and functions that JavaScript can use

// =============================================================================
// TODO 5.5.1: Implement Init() function
// =============================================================================
// WHAT: Initializes the addon and registers classes/functions
// WHY: JavaScript needs to know what C++ functionality is available
//
// STEP 1: Register ServerWrap class
//   This makes the Server class available in JavaScript
//   Call: ServerWrap::Init(env, exports)
//
// STEP 2: Return exports object
//   JavaScript will receive this object when it calls require()
//   return exports;
//
// JAVASCRIPT USAGE:
//   const flash = require('./build/Release/flash_native.node');
//   const server = new flash.Server(5627);  // Uses registered Server class
//
// COMPLETE FUNCTION:
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // TODO 5.5.1: Call ServerWrap::Init() to register the Flash server class
    std::cout << "[Addon] Initializing Flash native addon..." << std::endl;
    return ServerWrap::Init(env, exports);
}

// =============================================================================
// TODO 5.5.2: Register the addon with Node.js
// =============================================================================
// WHAT: This macro tells Node.js where to find the Init function
// WHY: Node.js needs to know the entry point of the addon
//
// PARAMETERS:
//   1. Module name: flash_native (matches binding.gyp target_name)
//   2. Init function: Init (the function above)
//
// HOW IT WORKS:
//   When JavaScript calls require('./build/Release/flash_native.node'),
//   Node.js calls the function registered here (Init)
//
// NOTE: This line is already correct! No need to change it.
NODE_API_MODULE(flash_native, Init)
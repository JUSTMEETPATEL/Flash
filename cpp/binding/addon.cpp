#include <napi.h>

// Flash Framework N-API Addon
// This is a stub implementation - will be expanded in Phase 2

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  // TODO: Export Flash class and related functions
  return exports;
}

NODE_API_MODULE(flash_native, Init)
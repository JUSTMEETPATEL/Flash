# Phase 2 Quick Start Guide

## 🎯 Goal

Learn N-API by implementing TODOs week by week, just like Phase 1!

## 📋 Prerequisites

1. **Phase 1 Complete** ✅

   - C++ HTTP server working
   - All 69 tests passing

2. **Node.js Installed** ✅

   - Version 16+ required
   - Check: `node --version`

3. **Build Tools** ✅
   - macOS: Xcode Command Line Tools
   - Check: `xcode-select --version`

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
# Install Node.js packages
npm install

# Verify node-addon-api is installed
ls node_modules/node-addon-api
```

Expected packages:

- `node-addon-api` - N-API C++ wrapper
- `@types/node` - TypeScript types for Node.js
- `typescript` - TypeScript compiler
- `jest` - Testing framework

### Step 2: Understanding the Structure

```
Phase 2 Files:
cpp/binding/
├── addon.cpp              # Addon entry point (TODO 5.5.1, 5.5.2)
├── type_converter.h       # Type conversion declarations (TODO 5.3.1-5.3.5)
├── type_converter.cpp     # Type conversion implementations
├── server_wrap.h          # ServerWrap class declaration (TODO 6.8.1-6.8.6)
└── server_wrap.cpp        # ServerWrap implementation (TODO 6.11.1-6.12.4)

tests/
└── test_native_binding.js # Tests for N-API binding (TODO 6.14.1-6.14.5)

docs/
└── PHASE2_PLAN.md         # Complete Phase 2 guide (READ THIS FIRST!)
```

### Step 3: Week-by-Week Workflow

#### Week 5: Type Converters

1. **Read** `docs/PHASE2_PLAN.md` - Week 5 section
2. **Open** `cpp/binding/type_converter.h`
3. **Implement** TODO 5.3.1: `js_to_string()`

   - Read the hints carefully
   - Check if value is string
   - Convert to std::string
   - Return std::nullopt on error

4. **Test** your implementation:

   ```bash
   # Build the addon
   npm run build

   # If successful, you'll see:
   # > node-gyp rebuild
   # ...
   # CXX(target) Release/obj.target/flash_native/cpp/binding/type_converter.o
   # ...
   # SOLINK_MODULE(target) Release/flash_native.node
   ```

5. **Move to next TODO**: 5.3.2, then 5.3.3, etc.

#### Week 6: ServerWrap

1. **Open** `cpp/binding/server_wrap.cpp`
2. **Start with** TODO 6.11.1: `Init()` method
3. **Test** with `node tests/test_native_binding.js`
4. **Continue** to next TODOs

#### Week 7: TypeScript API

1. **Create** `src/index.ts`
2. **Implement** TODOs from PHASE2_PLAN.md Week 7
3. **Test** with TypeScript

#### Week 8: Integration Testing

1. **Write** Jest tests
2. **Run** benchmarks
3. **Document** everything

## 📝 TODO Workflow (Same as Phase 1!)

For each TODO:

1. **Read** the TODO comment and all hints
2. **Research** if needed (N-API docs, examples)
3. **Implement** the code
4. **Build** the addon: `npm run build`
5. **Test** your implementation
6. **Fix** any errors
7. **Move** to next TODO

## 🔨 Build Commands

```bash
# Clean build
npm run clean
npm run build

# Debug build (with symbols)
npm run build:debug

# Rebuild (clean + build)
npm run clean && npm run build

# Test native binding
node tests/test_native_binding.js
```

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'node-addon-api'"

**Solution:**

```bash
npm install node-addon-api
```

### Issue 2: Build fails with "node-gyp not found"

**Solution:**

```bash
npm install -g node-gyp
```

### Issue 3: "error: use of undeclared identifier 'server\_'"

**Solution:** You haven't implemented the constructor yet (TODO 6.11.5)

### Issue 4: Segmentation fault when running tests

**Solution:**

- Check that you validated JavaScript arguments
- Make sure you're not accessing null pointers
- Verify you called parent constructor: `ObjectWrap(info)`

### Issue 5: "Module did not self-register"

**Solution:**

```bash
# Rebuild the addon
npm run clean
npm run build
```

## 📚 Learning Resources

### N-API Documentation

- **Official N-API Docs:** https://nodejs.org/api/n-api.html
- **node-addon-api:** https://github.com/nodejs/node-addon-api/blob/main/doc/
- **Examples:** https://github.com/nodejs/node-addon-examples

### Key Concepts

1. **ObjectWrap** - Wrapping C++ classes for JavaScript
2. **Type Validation** - Always check JavaScript types
3. **Error Handling** - Convert C++ exceptions to JS errors
4. **Memory Management** - Who owns the memory?

### Example Pattern

```cpp
// Always follow this pattern for N-API methods:

Napi::Value MyMethod(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // 1. Validate arguments
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected 1 argument")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected number")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    // 2. Extract values
    int value = info[0].As<Napi::Number>().Int32Value();

    // 3. Do work (with error handling)
    try {
        cpp_function(value);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what())
            .ThrowAsJavaScriptException();
        return env.Null();
    }

    // 4. Return result
    return env.Undefined();
}
```

## 🎯 Success Criteria

### Week 5 Complete When:

- ✅ Type converters implemented
- ✅ Addon compiles without errors
- ✅ Can build: `npm run build` succeeds

### Week 6 Complete When:

- ✅ ServerWrap class implemented
- ✅ Can create server from JavaScript
- ✅ All tests in test_native_binding.js pass

### Week 7 Complete When:

- ✅ TypeScript API works
- ✅ Can register routes
- ✅ Method chaining works

### Week 8 Complete When:

- ✅ All Jest tests pass
- ✅ Benchmarks complete
- ✅ Documentation finished

## 📖 Reading Order

1. **Start here:** `docs/PHASE2_PLAN.md` (complete guide)
2. **Week 5:** `cpp/binding/type_converter.h` (read all TODOs)
3. **Week 5:** `cpp/binding/type_converter.cpp` (implement TODOs)
4. **Week 5:** `cpp/binding/addon.cpp` (simple integration)
5. **Week 6:** `cpp/binding/server_wrap.h` (understand ObjectWrap)
6. **Week 6:** `cpp/binding/server_wrap.cpp` (implement methods)
7. **Week 6:** `tests/test_native_binding.js` (test it!)

## 💡 Tips

1. **Don't skip TODOs** - Each builds on previous knowledge
2. **Read hints carefully** - They guide you step-by-step
3. **Test frequently** - Build after each TODO
4. **Use debugger** - `lldb` for C++, `console.log` for JavaScript
5. **Ask for help** - When stuck, explain what you tried
6. **Celebrate progress** - Each working TODO is an achievement!

## 🚦 Your First Task

**Start with TODO 5.3.1** in `cpp/binding/type_converter.cpp`:

1. Open `cpp/binding/type_converter.cpp`
2. Find TODO 5.3.1 (js_to_string function)
3. Read all the hints
4. Implement the function
5. Build: `npm run build`
6. Check for errors
7. Move to TODO 5.3.2

## 🎉 Remember

Phase 1 taught you C++ and HTTP. Phase 2 teaches you:

- How Node.js native addons work
- Language interoperability (C++ ↔ JavaScript)
- Memory management across boundaries
- Type safety in dynamic languages
- Building developer-friendly APIs

**This is challenging but incredibly valuable!** Take your time, work through each TODO, and enjoy the learning process. 🚀

---

**Questions?** Review the hints in each TODO, check the N-API docs, or ask for help!

**Ready?** Open `cpp/binding/type_converter.cpp` and start with TODO 5.3.1!

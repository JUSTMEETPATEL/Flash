# Week 5 Summary - N-API Type Converters ✅

## 🎉 Congratulations! Week 5 Complete!

You successfully implemented the N-API type conversion layer and created a working JavaScript ↔ C++ bridge!

---

## ✅ What We Built This Week

### 1. Type Converter Functions (`cpp/binding/type_converter.cpp`)

#### ✅ TODO 5.3.1: `js_to_string()`

**What it does:** Converts JavaScript strings to C++ `std::string`

```cpp
std::optional<std::string> js_to_string(const Napi::Value& value)
```

- Validates value is a string
- Converts using `Utf8Value()`
- Returns `std::nullopt` on failure

#### ✅ TODO 5.3.2: `string_to_js()`

**What it does:** Converts C++ strings to JavaScript strings

```cpp
Napi::String string_to_js(Napi::Env env, const std::string& str)
```

- Simple one-liner: `Napi::String::New(env, str)`
- Always succeeds (no validation needed)

#### ✅ TODO 5.3.3: `js_to_int()`

**What it does:** Converts JavaScript numbers to C++ `int`

```cpp
std::optional<int> js_to_int(const Napi::Value& value)
```

- Validates value is a number
- Converts using `Int32Value()`
- Returns `std::nullopt` on failure

#### ✅ TODO 5.3.4: `js_to_request()`

**What it does:** Converts JavaScript objects to C++ `HttpRequest` structs

```cpp
std::optional<HttpRequest> js_to_request(const Napi::Object& obj)
```

- Extracts `method`, `path`, `headers`, `body`
- Validates required fields
- Builds C++ HttpRequest struct
- Handles optional fields gracefully

#### ✅ TODO 5.3.5: `response_to_js()`

**What it does:** Converts C++ `HttpResponse` to JavaScript objects

```cpp
Napi::Object response_to_js(Napi::Env env, const HttpResponse& response)
```

- Creates JavaScript object
- Sets `statusCode`, `reasonPhrase`, `body`
- Returns plain JavaScript object

#### ✅ BONUS: Helper Functions

- `js_to_string_array()` - Convert JS arrays to C++ vectors
- `js_to_string_map()` - Convert JS objects to C++ maps

### 2. Addon Entry Point (`cpp/binding/addon.cpp`)

#### ✅ TODO 5.5.1: Addon Initialization

**What it does:** Registers C++ classes with JavaScript

```cpp
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return ServerWrap::Init(env, exports);
}
```

- Called when Node.js loads the addon
- Registers the `Server` class
- Enables JavaScript to use C++ functionality

### 3. ServerWrap Class (Preview of Week 6!)

We also implemented parts of Week 6 to test our work:

#### ✅ ServerWrap::Init()

- Registers `Server` class with JavaScript
- Exports instance methods: `start()`, `stop()`, `isRunning()`, `getPort()`

#### ✅ ServerWrap Constructor

- Validates port number (1-65535)
- Creates C++ `HttpServer` instance
- Proper error handling with N-API exceptions

---

## 🎓 Key Concepts Learned

### 1. C++ File Structure

```
cpp/binding/type_converter.h  → Declarations (function signatures)
cpp/binding/type_converter.cpp → Implementations (actual code)
```

**Why?**

- Separates interface from implementation
- Enables faster compilation
- Standard C++ practice

### 2. Type Safety with std::optional

```cpp
std::optional<std::string> result = js_to_string(value);
if (result.has_value()) {
    std::string str = *result;  // Safe to use
} else {
    // Handle error
}
```

**Why?**

- Explicitly models "might fail" operations
- No magic return values (-1, nullptr, etc.)
- Compiler enforces checking

### 3. N-API Type Checking

```cpp
if (!value.IsString()) return std::nullopt;
if (!value.IsNumber()) return std::nullopt;
```

**Why?**

- JavaScript is dynamically typed
- C++ is statically typed
- Must validate types at the boundary

### 4. N-API Value Conversion

```cpp
// JS → C++
std::string str = value.As<Napi::String>().Utf8Value();
int num = value.As<Napi::Number>().Int32Value();

// C++ → JS
Napi::String jsStr = Napi::String::New(env, str);
Napi::Number jsNum = Napi::Number::New(env, num);
```

### 5. ObjectWrap Pattern

```cpp
class ServerWrap : public Napi::ObjectWrap<ServerWrap> {
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    ServerWrap(const Napi::CallbackInfo& info);
    // ... methods ...
private:
    std::unique_ptr<HttpServer> server_;  // C++ object
};
```

**Why?**

- Wraps C++ classes for JavaScript
- Manages lifetime automatically
- Exposes C++ methods to JS

---

## 🧪 Test Results

### Quick Test Output

```
Loading Flash native addon...
[Addon] Initializing Flash native addon...
[ServerWrap] Server class registered!
✅ Addon loaded successfully!
✅ Available exports: [ 'Server' ]
✅ Server class is available!

Trying to create a Server instance...
[HttpServer] Creating server on port 5627
[HttpServer] Socket created successfully (fd=16)
[ServerWrap] Server created on port 5627
✅ Server instance created!
✅ Server object: Server {}
[HttpServer] Destroying server...
[HttpServer] Server destroyed
```

**What this proves:**

- ✅ N-API addon loads correctly
- ✅ Server class is registered
- ✅ JavaScript can create C++ objects
- ✅ C++ server initializes properly
- ✅ RAII cleanup works (destructor called)

---

## 📊 Progress Summary

### Week 5 Checklist ✅

- [x] Type converter declarations (type_converter.h)
- [x] Type converter implementations (type_converter.cpp)
- [x] js_to_string() - JavaScript string → C++ string
- [x] string_to_js() - C++ string → JavaScript string
- [x] js_to_int() - JavaScript number → C++ int
- [x] js_to_request() - JavaScript object → C++ HttpRequest
- [x] response_to_js() - C++ HttpResponse → JavaScript object
- [x] Addon initialization (addon.cpp)
- [x] ServerWrap::Init() - Register class with JavaScript
- [x] ServerWrap constructor - Create C++ server from JS
- [x] Build system working (node-gyp)
- [x] Test addon loading

### Build Status ✅

```bash
npm run build:cpp
# ✅ Build successful
# ✅ All files compiled
# ✅ Native addon created: build/Release/flash_native.node
```

### Integration Test ✅

```bash
node tests/quick_test.js
# ✅ Addon loads
# ✅ Server class available
# ✅ Can create instances
# ✅ C++ server works
```

---

## 🚀 What's Next: Week 6

Now that type conversion is working, Week 6 will focus on:

### Week 6: ServerWrap Instance Methods

#### TODO 6.12.1: Start() Method

```typescript
server.start(); // Start HTTP server
```

#### TODO 6.12.2: Stop() Method

```typescript
server.stop(); // Stop HTTP server
```

#### TODO 6.12.3: IsRunning() Method

```typescript
if (server.isRunning()) { ... }
```

#### TODO 6.12.4: GetPort() Method

```typescript
const port = server.getPort(); // Returns 5627
```

### Week 7: TypeScript Wrapper Layer

- Create TypeScript API
- Add middleware support
- Build Express-like interface

### Week 8: Testing & Integration

- Write comprehensive tests
- Integration testing
- Performance benchmarks

---

## 💡 Key Takeaways

### What Worked Well ✅

1. **TODO-driven learning:** Incremental implementation with hints
2. **Build feedback:** Compiler errors guided corrections
3. **Test-driven:** Built test first, then verified functionality
4. **Header/implementation separation:** Learned proper C++ structure

### Challenges Overcome ✅

1. **Header vs implementation files:** Initially put code in wrong file
2. **API compatibility:** Had to check actual method names in HttpRequest/HttpResponse
3. **Build errors:** Missing includes, namespace issues
4. **Type conversion:** Understanding N-API value types

### Skills Developed ✅

1. ✅ C++ file structure and organization
2. ✅ N-API value conversion patterns
3. ✅ Type safety with std::optional
4. ✅ Error handling across language boundaries
5. ✅ node-gyp build system
6. ✅ ObjectWrap pattern basics

---

## 📝 Important Patterns to Remember

### 1. Type Conversion Pattern

```cpp
std::optional<Type> js_to_cpp(const Napi::Value& value) {
    // Step 1: Validate type
    if (!value.IsCorrectType()) {
        return std::nullopt;
    }

    // Step 2: Convert
    Type result = value.As<NapiType>().ConvertMethod();

    // Step 3: Return
    return result;
}
```

### 2. Object Extraction Pattern

```cpp
std::optional<MyStruct> js_to_struct(const Napi::Object& obj) {
    MyStruct result;

    // Extract required fields
    auto field = obj.Get("fieldName");
    auto fieldOpt = js_to_string(field);
    if (!fieldOpt.has_value()) {
        return std::nullopt;  // Required field missing
    }
    result.field = *fieldOpt;

    // Extract optional fields
    if (obj.Has("optionalField")) {
        auto opt = obj.Get("optionalField");
        if (!opt.IsNull() && !opt.IsUndefined()) {
            // Process optional field
        }
    }

    return result;
}
```

### 3. Error Handling Pattern

```cpp
ServerWrap::ServerWrap(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<ServerWrap>(info) {
    Napi::Env env = info.Env();

    // Validate argument count
    if (info.Length() < 1) {
        throw Napi::TypeError::New(env, "Expected 1 argument");
    }

    // Validate argument type
    if (!info[0].IsNumber()) {
        throw Napi::TypeError::New(env, "Argument must be a number");
    }

    // Validate argument value
    int value = info[0].As<Napi::Number>().Int32Value();
    if (value < 1 || value > 65535) {
        throw Napi::RangeError::New(env, "Port must be between 1 and 65535");
    }

    // Now safe to use
}
```

---

## 🎯 Final Thoughts

### You've Successfully:

1. ✅ Built a complete type conversion layer
2. ✅ Created a working N-API addon
3. ✅ Connected JavaScript to C++
4. ✅ Implemented proper error handling
5. ✅ Learned C++ best practices
6. ✅ Mastered the build system

### This Is Real-World Code!

The patterns you learned this week are used in production N-API addons like:

- `node-sass` (Sass compiler)
- `sqlite3` (Database bindings)
- `canvas` (Cairo graphics bindings)
- `bcrypt` (Crypto library)

### You're Building a Real Framework!

Your type converter is production-quality code that:

- Validates all inputs
- Handles errors gracefully
- Uses modern C++ (std::optional)
- Follows N-API best practices

---

## 📚 References

### Documentation You Used

- [N-API C++ Wrapper Documentation](https://github.com/nodejs/node-addon-api)
- [N-API Value Types](https://nodejs.org/api/n-api.html#n_api_napi_value)
- [ObjectWrap Pattern](https://github.com/nodejs/node-addon-api/blob/main/doc/object_wrap.md)

### Files You Modified

```
cpp/binding/type_converter.h       (declarations)
cpp/binding/type_converter.cpp     (implementations)
cpp/binding/addon.cpp              (entry point)
cpp/binding/server_wrap.cpp        (preview of Week 6)
tests/quick_test.js                (integration test)
```

---

## 🏁 Ready for Week 6!

You've completed the foundation of N-API integration. Next week, you'll:

1. Implement the remaining ServerWrap methods
2. Add async operations (non-blocking server start)
3. Handle callbacks from C++ to JavaScript
4. Build the complete Server API

Great work! 🚀

---

**Week 5 Status:** ✅ COMPLETE  
**Next:** Week 6 - ServerWrap Methods & Async Operations  
**Files to focus on:** `cpp/binding/server_wrap.cpp`

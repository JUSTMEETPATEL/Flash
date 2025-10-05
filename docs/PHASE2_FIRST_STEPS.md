# 🎉 Phase 2 - Your First Steps

## ✅ Build Successful!

Great news! The addon compiles successfully. This means:

- ✅ All files are syntactically correct
- ✅ Dependencies are properly linked
- ✅ Build system is working

Now you're ready to implement the TODOs!

## 📋 Current Status

**What works:**

- ✅ Build system configured correctly
- ✅ All files compile without errors
- ✅ Only 1 warning (unused variable - expected)

**What doesn't work yet:**

- ❌ TODOs are not implemented (just stubs)
- ❌ Functions return placeholder values
- ❌ Tests will fail because functionality is missing

## 🎯 Your First TODO: js_to_string()

### Step 1: Open the File

```bash
code cpp/binding/type_converter.cpp
```

Or open it in your editor and find line ~30.

### Step 2: Find TODO 5.3.1

Look for this function:

```cpp
std::optional<std::string> js_to_string(const Napi::Value& value) {
    // TODO: Implement this function
    // Check if it's a string, convert it, return std::nullopt on error

    return std::nullopt;  // Replace this with your implementation
}
```

### Step 3: Read All the Hints

Scroll up to see the detailed TODO comment above the function. It has:

- WHAT: Description of what to do
- WHY: Why this is important
- HINT 1, 2, 3: Step-by-step guidance
- EXAMPLE USAGE: How it will be used

### Step 4: Implement the Function

Based on the hints, here's what you need to do:

```cpp
std::optional<std::string> js_to_string(const Napi::Value& value) {
    // STEP 1: Check if value is a string
    if (!value.IsString()) {
        return std::nullopt;  // Not a string, return empty optional
    }

    // STEP 2: Convert to C++ string
    Napi::String jsString = value.As<Napi::String>();
    std::string cppString = jsString.Utf8Value();

    // STEP 3: Return the string
    return cppString;
}
```

**Or more concisely:**

```cpp
std::optional<std::string> js_to_string(const Napi::Value& value) {
    if (!value.IsString()) {
        return std::nullopt;
    }

    return value.As<Napi::String>().Utf8Value();
}
```

### Step 5: Build and Test

```bash
npm run build:cpp
```

If successful, you've completed TODO 5.3.1! 🎉

## 📝 Next TODOs (In Order)

After completing TODO 5.3.1, continue with:

### TODO 5.3.2: string_to_js()

**File:** `cpp/binding/type_converter.cpp`  
**What:** Convert C++ string to JavaScript string  
**Difficulty:** ⭐ (Very easy - one line!)

**Implementation:**

```cpp
Napi::String string_to_js(Napi::Env env, const std::string& str) {
    return Napi::String::New(env, str);
}
```

### TODO 5.3.3: js_to_int()

**File:** `cpp/binding/type_converter.cpp`  
**What:** Convert JavaScript number to C++ int  
**Difficulty:** ⭐⭐ (Similar to js_to_string)

**Implementation:**

```cpp
std::optional<int> js_to_int(const Napi::Value& value) {
    if (!value.IsNumber()) {
        return std::nullopt;
    }

    return value.As<Napi::Number>().Int32Value();
}
```

### TODO 5.3.4: js_to_request()

**File:** `cpp/binding/type_converter.cpp`  
**What:** Convert JavaScript object to C++ HttpRequest  
**Difficulty:** ⭐⭐⭐⭐ (More complex - objects have multiple fields)

**Hints:**

- Check if object has required properties: `obj.Has("method")`
- Extract each property: `obj.Get("method")`
- Convert headers object to C++ map (loop through properties)
- Handle optional body (might be null/undefined)

### TODO 5.3.5: response_to_js()

**File:** `cpp/binding/type_converter.cpp`  
**What:** Convert C++ HttpResponse to JavaScript object  
**Difficulty:** ⭐⭐⭐⭐ (Create object, set multiple properties)

**Hints:**

- Create object: `Napi::Object::New(env)`
- Set properties: `obj.Set("status", Napi::Number::New(env, status))`
- Convert headers map to JavaScript object
- Convert body string to JavaScript string

### TODO 5.5.1: Init() in addon.cpp

**File:** `cpp/binding/addon.cpp`  
**What:** Register ServerWrap class with JavaScript  
**Difficulty:** ⭐ (Very easy - one line!)

**Implementation:**

```cpp
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return ServerWrap::Init(env, exports);
}
```

## 🧪 Testing Your Implementation

### After Each TODO

1. **Build:**

   ```bash
   npm run build:cpp
   ```

2. **Check for errors:**
   - If it compiles: Great! Move to next TODO
   - If it fails: Read the error, fix it, rebuild

### After Completing Week 5 TODOs

Try loading the addon:

```bash
node -e "const flash = require('./build/Release/flash_native.node'); console.log('✅ Addon loaded successfully!');"
```

### Running the Test File

```bash
node tests/test_native_binding.js
```

Initially, this will just print TODOs. As you implement ServerWrap (Week 6), you'll uncomment the tests.

## 📊 Progress Tracking

### Week 5 Checklist

- [ ] TODO 5.3.1: js_to_string() implemented
- [ ] TODO 5.3.2: string_to_js() implemented
- [ ] TODO 5.3.3: js_to_int() implemented
- [ ] TODO 5.3.4: js_to_request() implemented
- [ ] TODO 5.3.5: response_to_js() implemented
- [ ] TODO 5.5.1: Init() in addon.cpp implemented
- [ ] All type converters compile without errors
- [ ] Addon loads successfully in Node.js

When all checked, you're ready for Week 6! 🎉

## 💡 Tips for Success

1. **Do TODOs in order** - Each builds on previous knowledge
2. **Read hints carefully** - They contain step-by-step guidance
3. **Build frequently** - After each TODO or even each step
4. **Don't skip validation** - Always check JavaScript types before converting
5. **Use Phase 1 knowledge** - std::optional, error handling, RAII

## 🐛 Common Mistakes to Avoid

### Mistake 1: Forgetting Type Checks

```cpp
// ❌ BAD: No type check
std::optional<int> js_to_int(const Napi::Value& value) {
    return value.As<Napi::Number>().Int32Value();  // CRASH if not a number!
}

// ✅ GOOD: Always check first
std::optional<int> js_to_int(const Napi::Value& value) {
    if (!value.IsNumber()) {
        return std::nullopt;
    }
    return value.As<Napi::Number>().Int32Value();
}
```

### Mistake 2: Not Handling Null/Undefined

```cpp
// ❌ BAD: Crash on null
if (obj.Has("body")) {
    body = obj.Get("body").As<Napi::String>().Utf8Value();  // CRASH if null!
}

// ✅ GOOD: Check for null/undefined
if (obj.Has("body") && !obj.Get("body").IsNull() && !obj.Get("body").IsUndefined()) {
    auto bodyOpt = js_to_string(obj.Get("body"));
    if (bodyOpt.has_value()) {
        body = *bodyOpt;
    }
}
```

### Mistake 3: Memory Leaks

```cpp
// ❌ BAD: Manual memory management
char* str = new char[100];
// ... forget to delete

// ✅ GOOD: Use std::string (automatic memory management)
std::string str = value.As<Napi::String>().Utf8Value();
```

## 🎯 Your Action Plan

**Right now (5 minutes):**

1. Open `cpp/binding/type_converter.cpp`
2. Find TODO 5.3.1 (line ~30)
3. Read the hints above the function

**Next (15 minutes):**

1. Implement TODO 5.3.1: js_to_string()
2. Build: `npm run build:cpp`
3. Verify it compiles

**Then (30 minutes):**

1. Implement TODO 5.3.2: string_to_js()
2. Implement TODO 5.3.3: js_to_int()
3. Build after each one

**Finally (1 hour):**

1. Implement TODO 5.3.4: js_to_request() (complex!)
2. Implement TODO 5.3.5: response_to_js() (complex!)
3. Implement TODO 5.5.1: Init() in addon.cpp
4. Final build and test

## 🚀 Ready to Start?

Open `cpp/binding/type_converter.cpp` and find TODO 5.3.1!

Remember: **You got this!** The build is working, the structure is ready, now it's just implementing the logic step by step.

Take your time, read the hints, and enjoy the learning process! 💪

---

**Questions?** Check the hints in the code or ask for help!

**Stuck?** Review the N-API docs: https://nodejs.org/api/n-api.html

**Done with TODO 5.3.1?** Come back and celebrate, then move to 5.3.2!

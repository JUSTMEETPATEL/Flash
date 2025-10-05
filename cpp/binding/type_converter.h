#pragma once
#include <napi.h>
#include <string>
#include <optional>
#include <map>
#include <vector>
#include "../include/http_request.h"
#include "../include/http_response.h"

namespace flash {
namespace binding {

// =============================================================================
// WEEK 5, DAY 3: TYPE CONVERSION UTILITIES
// =============================================================================
// These functions convert between C++ and JavaScript types
// This is crucial for passing data across the language boundary
//
// LEARNING OBJECTIVE: Understand how to safely convert types between languages
// - JavaScript values can be: number, string, object, array, null, undefined
// - C++ has strong typing: int, std::string, custom classes
// - We need safe conversion with error handling

// =============================================================================
// TODO 5.3.1: Convert JavaScript string to C++ std::string
// =============================================================================
// WHAT: Takes a Napi::Value from JavaScript and converts it to std::string
// WHY: JavaScript strings need to be converted to C++ strings for processing
// 
// HINT 1: First check if the value is actually a string: value.IsString()
// HINT 2: If not a string, return std::nullopt (optional with no value)
// HINT 3: Use Napi::String::Utf8Value() to get C-style string
// HINT 4: Convert to std::string: std::string(utf8Value)
//
// EXAMPLE USAGE:
//   auto str = js_to_string(info[0]);
//   if (str.has_value()) {
//       std::cout << "Got string: " << *str << std::endl;
//   }
//
// JAVASCRIPT SIDE:
//   nativeFunction("hello")  // info[0] will be "hello"
//
std::optional<std::string> js_to_string(const Napi::Value& value);

// =============================================================================
// TODO 5.3.2: Convert C++ string to JavaScript string
// =============================================================================
// WHAT: Takes a C++ std::string and converts it to JavaScript string
// WHY: C++ strings need to be converted to JavaScript strings to return to JS
//
// HINT 1: Use Napi::String::New(env, str)
// HINT 2: Handle empty strings - they're valid!
// HINT 3: This should never fail (unlike JS→C++ conversion)
//
// EXAMPLE USAGE:
//   std::string cppStr = "Hello from C++";
//   return string_to_js(env, cppStr);
//
// JAVASCRIPT SIDE:
//   const result = nativeFunction();  // Gets "Hello from C++"
//
Napi::String string_to_js(Napi::Env env, const std::string& str);

// =============================================================================
// TODO 5.3.3: Convert JavaScript number to C++ int
// =============================================================================
// WHAT: Takes a Napi::Value from JavaScript and converts it to int
// WHY: JavaScript numbers need to be converted to C++ integers
//
// HINT 1: Check if value is a number: value.IsNumber()
// HINT 2: Use value.As<Napi::Number>().Int32Value() to extract
// HINT 3: Return std::nullopt if not a number
// HINT 4: Consider adding range validation (e.g., for port numbers 1-65535)
//
// EXAMPLE USAGE:
//   auto port = js_to_int(info[0]);
//   if (port.has_value() && *port >= 1 && *port <= 65535) {
//       // Valid port number
//   }
//
// JAVASCRIPT SIDE:
//   nativeFunction(5627)  // info[0] will be 5627
//
std::optional<int> js_to_int(const Napi::Value& value);

// =============================================================================
// TODO 5.3.4: Convert JavaScript object to C++ HttpRequest
// =============================================================================
// WHAT: Takes a JavaScript object and converts it to HttpRequest struct
// WHY: JavaScript needs to pass HTTP request data to C++ for processing
//
// HINT 1: Check if value is an object: obj.IsObject()
// HINT 2: Extract properties using obj.Get("propertyName")
// HINT 3: JavaScript object structure:
//         {
//             method: "GET",
//             path: "/api/test",
//             headers: { "Content-Type": "application/json" },
//             body: "optional body string"
//         }
// HINT 4: Headers are an object, iterate with obj.GetPropertyNames()
// HINT 5: Body might be null/undefined - handle with std::optional
// HINT 6: Return std::nullopt if object is missing required fields
//
// EXAMPLE USAGE:
//   auto req = js_to_request(info[0].As<Napi::Object>());
//   if (req.has_value()) {
//       std::cout << "Method: " << req->method << std::endl;
//   }
//
// JAVASCRIPT SIDE:
//   nativeFunction({
//       method: "GET",
//       path: "/api/users",
//       headers: { "Accept": "application/json" },
//       body: null
//   })
//
std::optional<HttpRequest> js_to_request(const Napi::Object& obj);

// =============================================================================
// TODO 5.3.5: Convert C++ HttpResponse to JavaScript object
// =============================================================================
// WHAT: Takes a C++ HttpResponse and converts it to JavaScript object
// WHY: C++ needs to return HTTP response data to JavaScript
//
// HINT 1: Create new object: Napi::Object::New(env)
// HINT 2: Set properties: obj.Set("status", Napi::Number::New(env, status))
// HINT 3: Convert headers map to JavaScript object:
//         - Create headers object: Napi::Object::New(env)
//         - Iterate C++ map: for (auto& [key, value] : headers)
//         - Set each header: headersObj.Set(key, value)
// HINT 4: Convert body string to JavaScript string
// HINT 5: JavaScript object structure:
//         {
//             status: 200,
//             headers: { "Content-Type": "text/html" },
//             body: "<html>...</html>"
//         }
//
// EXAMPLE USAGE:
//   HttpResponse resp(200);
//   resp.set_header("Content-Type", "application/json");
//   resp.set_body("{\"success\": true}");
//   return response_to_js(env, resp);
//
// JAVASCRIPT SIDE:
//   const response = nativeFunction();
//   console.log(response.status);      // 200
//   console.log(response.body);        // {"success": true}
//
Napi::Object response_to_js(Napi::Env env, const HttpResponse& response);

// =============================================================================
// HELPER FUNCTIONS (Optional - Week 5, Day 4)
// =============================================================================
// These are optional helper functions that make type conversion easier
// Implement these if you find yourself repeating code

// TODO 5.4.1 (OPTIONAL): Convert JavaScript array to C++ vector
// HINT 1: Check value.IsArray()
// HINT 2: Get length: array.Length()
// HINT 3: Iterate and convert each element
std::optional<std::vector<std::string>> js_to_string_array(const Napi::Array& arr);

// TODO 5.4.2 (OPTIONAL): Convert JavaScript object to C++ map (for headers)
// HINT 1: Get property names: obj.GetPropertyNames()
// HINT 2: Iterate and convert each key-value pair
std::optional<std::map<std::string, std::string>> js_to_string_map(const Napi::Object& obj);

} // namespace binding
} // namespace flash

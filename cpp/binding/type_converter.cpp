#include "type_converter.h"
#include <iostream>

namespace flash {
namespace binding {

// =============================================================================
// WEEK 5, DAY 3: TYPE CONVERTER IMPLEMENTATIONS
// =============================================================================

// =============================================================================
// TODO 5.3.1: Implement js_to_string()
// =============================================================================
std::optional<std::string> js_to_string(const Napi::Value& value) {
    // Check if it's a string
    if (!value.IsString()) {
        return std::nullopt;
    }
    
    // Convert to C++ string
    return value.As<Napi::String>().Utf8Value();
}

// =============================================================================
// TODO 5.3.2: Implement string_to_js()
// =============================================================================
Napi::String string_to_js(Napi::Env env, const std::string& str) {
    // No need to check for empty - Napi::String::New handles it
    return Napi::String::New(env, str);
}

// =============================================================================
// TODO 5.3.3: Implement js_to_int()
// =============================================================================
std::optional<int> js_to_int(const Napi::Value& value) {
    // Check if it's a number
    if (!value.IsNumber()) {
        return std::nullopt;
    }
    
    // Convert to int
    return value.As<Napi::Number>().Int32Value();
}

// =============================================================================
// TODO 5.3.4: Implement js_to_request()
// =============================================================================
std::optional<HttpRequest> js_to_request(const Napi::Object& obj) {
    if (!obj.IsObject()) {
        return std::nullopt;
    }

    HttpRequest request;

    // Extract method
    auto methodValue = obj.Get("method");
    auto methodOpt = js_to_string(methodValue);
    if (!methodOpt.has_value()) {
        return std::nullopt; // method is required
    }
    request.method = *methodOpt;

    // Extract path
    auto pathValue = obj.Get("path");
    auto pathOpt = js_to_string(pathValue);
    if (!pathOpt.has_value()) {
        return std::nullopt; // path is required
    }
    request.path = *pathOpt;

    // Extract headers
    auto headersValue = obj.Get("headers");
    if (headersValue.IsObject()) {
        auto headersObj = headersValue.As<Napi::Object>();
        auto headerNames = headersObj.GetPropertyNames();
        for (uint32_t i = 0; i < headerNames.Length(); ++i) {
            auto key = headerNames.Get(i);
            auto keyStrOpt = js_to_string(key);
            if (!keyStrOpt.has_value()) continue; // skip invalid keys

            auto value = headersObj.Get(*keyStrOpt);
            auto valueStrOpt = js_to_string(value);
            if (!valueStrOpt.has_value()) continue; // skip invalid values

            // HttpRequest::headers is a public member (unordered_map)
            request.headers[*keyStrOpt] = *valueStrOpt;
        }
    }

    // Extract body (optional)
    auto bodyValue = obj.Get("body");
    if (bodyValue.IsString()) {
        auto bodyOpt = js_to_string(bodyValue);
        if (bodyOpt.has_value()) {
            request.body = *bodyOpt;
        }
    } else if (bodyValue.IsNull() || bodyValue.IsUndefined()) {
        request.body = ""; // No body
    } else {
        return std::nullopt; // Invalid body type
    }

    return request;
}

// =============================================================================
// TODO 5.3.5: Implement response_to_js()
// =============================================================================
Napi::Object response_to_js(Napi::Env env, const HttpResponse& response) {
    Napi::Object obj = Napi::Object::New(env);

    // Set status code
    obj.Set("statusCode", Napi::Number::New(env, response.get_status_code()));
    
    // Set reason phrase
    obj.Set("reasonPhrase", string_to_js(env, response.get_reason_phrase()));

    // Set body
    obj.Set("body", string_to_js(env, response.get_body()));

    // Note: HttpResponse headers are private, we'd need to add a getter method
    // For now, we'll add an empty headers object
    // TODO: Add get_headers() method to HttpResponse class in future
    Napi::Object headersObj = Napi::Object::New(env);
    obj.Set("headers", headersObj);

    return obj;
}

// =============================================================================
// OPTIONAL HELPER FUNCTIONS (Week 5, Day 4)
// =============================================================================

// TODO 5.4.1 (OPTIONAL): Implement js_to_string_array()
std::optional<std::vector<std::string>> js_to_string_array(const Napi::Array& arr) {
    if (!arr.IsArray()) {
        return std::nullopt;
    }

    std::vector<std::string> result;
    for (uint32_t i = 0; i < arr.Length(); ++i) {
        auto elem = arr.Get(i);
        auto strOpt = js_to_string(elem);
        if (strOpt.has_value()) {
            result.push_back(*strOpt);
        } else {
            return std::nullopt; // Invalid element
        }
    }
    return result;
}

// TODO 5.4.2 (OPTIONAL): Implement js_to_string_map()
std::optional<std::map<std::string, std::string>> js_to_string_map(const Napi::Object& obj) {
    if (!obj.IsObject()) {
        return std::nullopt;
    }

    std::map<std::string, std::string> result;
    auto propNames = obj.GetPropertyNames();
    for (uint32_t i = 0; i < propNames.Length(); ++i) {
        auto key = propNames.Get(i);
        auto keyStrOpt = js_to_string(key);
        if (!keyStrOpt.has_value()) continue; // skip invalid keys

        auto value = obj.Get(*keyStrOpt);
        auto valueStrOpt = js_to_string(value);
        if (!valueStrOpt.has_value()) continue; // skip invalid values

        result[*keyStrOpt] = *valueStrOpt;
    }
    return result;
}

} // namespace binding
} // namespace flash
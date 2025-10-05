{
  "targets": [
    {
      "target_name": "flash_native",
      "sources": [
        "cpp/binding/addon.cpp",
        "cpp/binding/type_converter.cpp",
        "cpp/binding/server_wrap.cpp",
        "cpp/src/server.cpp",
        "cpp/src/http_parser.cpp",
        "cpp/src/http_request.cpp",
        "cpp/src/http_response.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "cpp/include"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [
        "-fno-exceptions"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "cflags_cc": [
        "-std=c++20"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "conditions": [
        [
          "OS=='mac'",
          {
            "xcode_settings": {
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
              "MACOSX_DEPLOYMENT_TARGET": "10.15"
            }
          }
        ]
      ]
    }
  ]
}

/**
 * @file request.test.ts
 * @brief Unit tests for Request class
 * @author Flash Framework Team
 * @date 2025-10-07
 */

import { Request } from "../../src/request";

describe("Request", () => {
  let request: Request;

  beforeEach(() => {
    request = new Request(
      "GET",
      "/api/users/123",
      { id: "123" },
      { page: "1", limit: "10" },
      { "Content-Type": "application/json", "User-Agent": "Test" },
      { name: "Test User" }
    );
  });

  describe("constructor", () => {
    test("should create request with all properties", () => {
      expect(request.method).toBe("GET");
      expect(request.path).toBe("/api/users/123");
      expect(request.params).toEqual({ id: "123" });
      expect(request.query).toEqual({ page: "1", limit: "10" });
      expect(request.headers).toEqual({
        "Content-Type": "application/json",
        "User-Agent": "Test",
      });
      expect(request.body).toEqual({ name: "Test User" });
    });

    test("should create request without body", () => {
      const req = new Request("GET", "/api/users", {}, {}, {});
      expect(req.body).toBeUndefined();
    });
  });

  describe("getHeader()", () => {
    test("should get header case-insensitively", () => {
      expect(request.getHeader("content-type")).toBe("application/json");
      expect(request.getHeader("Content-Type")).toBe("application/json");
      expect(request.getHeader("CONTENT-TYPE")).toBe("application/json");
    });

    test("should return undefined for non-existent header", () => {
      expect(request.getHeader("Authorization")).toBeUndefined();
    });

    test("should handle User-Agent header", () => {
      expect(request.getHeader("user-agent")).toBe("Test");
      expect(request.getHeader("User-Agent")).toBe("Test");
    });
  });

  describe("hasHeader()", () => {
    test("should return true for existing header", () => {
      expect(request.hasHeader("Content-Type")).toBe(true);
      expect(request.hasHeader("content-type")).toBe(true);
      expect(request.hasHeader("User-Agent")).toBe(true);
    });

    test("should return false for non-existent header", () => {
      expect(request.hasHeader("Authorization")).toBe(false);
      expect(request.hasHeader("X-Custom-Header")).toBe(false);
    });
  });

  describe("getQueryParam()", () => {
    test("should get query parameter value", () => {
      expect(request.getQueryParam("page")).toBe("1");
      expect(request.getQueryParam("limit")).toBe("10");
    });

    test("should return undefined for non-existent query param", () => {
      expect(request.getQueryParam("offset")).toBeUndefined();
    });
  });

  describe("getRouteParam()", () => {
    test("should get route parameter value", () => {
      expect(request.getRouteParam("id")).toBe("123");
    });

    test("should return undefined for non-existent route param", () => {
      expect(request.getRouteParam("name")).toBeUndefined();
    });
  });

  describe("read-only properties", () => {
    test("properties are accessible", () => {
      // Note: TypeScript readonly is compile-time only
      // At runtime, properties are still accessible
      expect(request.method).toBe("GET");
      expect(request.path).toBe("/api/users/123");
      expect(request.params).toEqual({ id: "123" });
      expect(request.query).toEqual({ page: "1", limit: "10" });
      expect(request.headers).toBeDefined();
      expect(request.body).toBeDefined();
    });
  });
});

/**
 * @file response.test.ts
 * @brief Unit tests for Response class
 * @author Flash Framework Team
 * @date 2025-10-07
 */

import { Response } from "../../src/response";

describe("Response", () => {
  let response: Response;

  beforeEach(() => {
    response = new Response();
    // Spy on console.log to avoid cluttering test output
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("status()", () => {
    test("should set status code and return this", () => {
      const result = response.status(404);
      expect(result).toBe(response); // Method chaining
      expect(response.getStatusCode()).toBe(404);
    });

    test("should accept valid status codes", () => {
      expect(() => response.status(100)).not.toThrow();
      expect(() => response.status(200)).not.toThrow();
      expect(() => response.status(404)).not.toThrow();
      expect(() => response.status(500)).not.toThrow();
      expect(() => response.status(599)).not.toThrow();
    });

    test("should reject invalid status codes", () => {
      expect(() => response.status(99)).toThrow("Invalid status code: 99");
      expect(() => response.status(600)).toThrow("Invalid status code: 600");
      expect(() => response.status(0)).toThrow("Invalid status code: 0");
      expect(() => response.status(-1)).toThrow("Invalid status code: -1");
    });

    test("should allow method chaining", () => {
      const result = response.status(201).header("X-Custom", "value");
      expect(result).toBe(response);
      expect(response.getStatusCode()).toBe(201);
    });
  });

  describe("header()", () => {
    test("should set header and return this", () => {
      const result = response.header("Content-Type", "application/json");
      expect(result).toBe(response); // Method chaining
      expect(response.getHeaders()["content-type"]).toBe("application/json");
    });

    test("should store headers in lowercase", () => {
      response.header("Content-Type", "text/html");
      response.header("X-Custom-Header", "custom-value");

      const headers = response.getHeaders();
      expect(headers["content-type"]).toBe("text/html");
      expect(headers["x-custom-header"]).toBe("custom-value");
    });

    test("should allow multiple headers", () => {
      response
        .header("Content-Type", "application/json")
        .header("X-Request-ID", "12345")
        .header("Cache-Control", "no-cache");

      const headers = response.getHeaders();
      expect(headers["content-type"]).toBe("application/json");
      expect(headers["x-request-id"]).toBe("12345");
      expect(headers["cache-control"]).toBe("no-cache");
    });

    test("should overwrite existing header", () => {
      response.header("Content-Type", "text/html");
      response.header("Content-Type", "application/json");

      expect(response.getHeaders()["content-type"]).toBe("application/json");
    });
  });

  describe("json()", () => {
    test("should set Content-Type and send JSON", () => {
      const data = { message: "Hello", status: "success" };
      response.json(data);

      expect(response.getHeaders()["content-type"]).toBe("application/json");
      expect(response.isSent()).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        "Response [200]:",
        JSON.stringify(data)
      );
    });

    test("should work with status chaining", () => {
      const data = { error: "Not Found" };
      response.status(404).json(data);

      expect(response.getStatusCode()).toBe(404);
      expect(response.getHeaders()["content-type"]).toBe("application/json");
      expect(console.log).toHaveBeenCalledWith(
        "Response [404]:",
        JSON.stringify(data)
      );
    });

    test("should throw error if already sent", () => {
      response.json({ message: "First" });
      expect(() => response.json({ message: "Second" })).toThrow(
        "Response has already been sent."
      );
    });

    test("should handle arrays", () => {
      const data = [1, 2, 3, 4, 5];
      response.json(data);

      expect(console.log).toHaveBeenCalledWith(
        "Response [200]:",
        JSON.stringify(data)
      );
    });

    test("should handle null and undefined", () => {
      response.json(null);
      expect(console.log).toHaveBeenCalledWith("Response [200]:", "null");
    });
  });

  describe("send()", () => {
    test("should send string data", () => {
      response.send("Hello, World!");

      expect(response.isSent()).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        "Response [200]:",
        "Hello, World!"
      );
    });

    test("should work with status and headers", () => {
      response.status(201).header("Content-Type", "text/plain").send("Created");

      expect(response.getStatusCode()).toBe(201);
      expect(response.getHeaders()["content-type"]).toBe("text/plain");
      expect(console.log).toHaveBeenCalledWith("Response [201]:", "Created");
    });

    test("should throw error if already sent", () => {
      response.send("First");
      expect(() => response.send("Second")).toThrow(
        "Response has already been sent."
      );
    });
  });

  describe("end()", () => {
    test("should end response", () => {
      response.end();

      expect(response.isSent()).toBe(true);
      expect(console.log).toHaveBeenCalledWith("Response [200] ended.");
    });

    test("should work with status and headers", () => {
      response.status(204).header("X-Custom", "value").end();

      expect(response.getStatusCode()).toBe(204);
      expect(response.getHeaders()["x-custom"]).toBe("value");
    });

    test("should throw error if already ended", () => {
      response.end();
      expect(() => response.end()).toThrow("Response has already been ended.");
    });

    test("should throw error if already sent", () => {
      response.send("Data");
      expect(() => response.end()).toThrow("Response has already been ended.");
    });
  });

  describe("method chaining", () => {
    test("should allow complex chaining", () => {
      const result = response
        .status(201)
        .header("Content-Type", "application/json")
        .header("X-Request-ID", "12345");

      expect(result).toBe(response);
      expect(response.getStatusCode()).toBe(201);
      expect(response.getHeaders()).toEqual({
        "content-type": "application/json",
        "x-request-id": "12345",
      });
    });
  });
});

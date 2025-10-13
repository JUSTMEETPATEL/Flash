/**
 * @file router.test.ts
 * @brief Unit tests for Router class
 */

import { Router } from "../../src/router";
import { Request } from "../../src/request";
import { Response } from "../../src/response";

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
  });

  describe("Route Registration", () => {
    test("should register a GET route", () => {
      const handler = jest.fn();
      router.get("/users", handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe("GET");
      expect(routes[0].path).toBe("/users");
      expect(routes[0].handler).toBe(handler);
    });

    test("should register a POST route", () => {
      const handler = jest.fn();
      router.post("/users", handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe("POST");
    });

    test("should register a PUT route", () => {
      const handler = jest.fn();
      router.put("/users/:id", handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe("PUT");
    });

    test("should register a DELETE route", () => {
      const handler = jest.fn();
      router.delete("/users/:id", handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe("DELETE");
    });

    test("should support method chaining", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      const result = router
        .get("/users", handler1)
        .post("/users", handler2)
        .put("/users/:id", handler3);

      expect(result).toBe(router);
      expect(router.getRoutes()).toHaveLength(3);
    });

    test("should register multiple routes", () => {
      router.get("/users", jest.fn());
      router.post("/users", jest.fn());
      router.get("/posts", jest.fn());

      expect(router.getRoutes()).toHaveLength(3);
    });
  });

  describe("Parameter Parsing", () => {
    test("should parse route with no parameters", () => {
      router.get("/users", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].paramNames).toEqual([]);
    });

    test("should parse route with single parameter", () => {
      router.get("/users/:id", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].paramNames).toEqual(["id"]);
    });

    test("should parse route with multiple parameters", () => {
      router.get("/users/:userId/posts/:postId", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].paramNames).toEqual(["userId", "postId"]);
    });

    test("should parse parameters with underscores", () => {
      router.get("/users/:user_id/posts/:post_id", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].paramNames).toEqual(["user_id", "post_id"]);
    });

    test("should parse complex route patterns", () => {
      router.get(
        "/api/v1/users/:userId/orders/:orderId/items/:itemId",
        jest.fn()
      );

      const routes = router.getRoutes();
      expect(routes[0].paramNames).toEqual(["userId", "orderId", "itemId"]);
    });
  });

  describe("Path to Regex Conversion", () => {
    test("should match static routes exactly", () => {
      router.get("/users", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].regex.test("/users")).toBe(true);
      expect(routes[0].regex.test("/users/")).toBe(false);
      expect(routes[0].regex.test("/users/123")).toBe(false);
    });

    test("should match dynamic routes with parameters", () => {
      router.get("/users/:id", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].regex.test("/users/123")).toBe(true);
      expect(routes[0].regex.test("/users/abc")).toBe(true);
      expect(routes[0].regex.test("/users/abc-def")).toBe(true);
    });

    test("should not match routes with extra segments", () => {
      router.get("/users/:id", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].regex.test("/users/123/posts")).toBe(false);
    });

    test("should match routes with multiple parameters", () => {
      router.get("/users/:userId/posts/:postId", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].regex.test("/users/123/posts/456")).toBe(true);
      expect(routes[0].regex.test("/users/abc/posts/xyz")).toBe(true);
    });

    test("should not match partial paths", () => {
      router.get("/users/:id", jest.fn());

      const routes = router.getRoutes();
      expect(routes[0].regex.test("/user/123")).toBe(false);
      expect(routes[0].regex.test("/api/users/123")).toBe(false);
    });
  });

  describe("Route Matching", () => {
    test("should find matching static route", () => {
      const handler = jest.fn();
      router.get("/users", handler);

      const match = router.findRoute("GET", "/users");

      expect(match).not.toBeNull();
      expect(match?.route.handler).toBe(handler);
      expect(match?.params).toEqual({});
    });

    test("should find matching dynamic route", () => {
      const handler = jest.fn();
      router.get("/users/:id", handler);

      const match = router.findRoute("GET", "/users/123");

      expect(match).not.toBeNull();
      expect(match?.params).toEqual({ id: "123" });
    });

    test("should extract multiple parameters", () => {
      const handler = jest.fn();
      router.get("/users/:userId/posts/:postId", handler);

      const match = router.findRoute("GET", "/users/123/posts/456");

      expect(match).not.toBeNull();
      expect(match?.params).toEqual({ userId: "123", postId: "456" });
    });

    test("should return null for non-matching path", () => {
      router.get("/users", jest.fn());

      const match = router.findRoute("GET", "/posts");

      expect(match).toBeNull();
    });

    test("should return null for non-matching method", () => {
      router.get("/users", jest.fn());

      const match = router.findRoute("POST", "/users");

      expect(match).toBeNull();
    });

    test("should match the first registered route", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      router.get("/users/:id", handler1);
      router.get("/users/:userId", handler2);

      const match = router.findRoute("GET", "/users/123");

      expect(match?.route.handler).toBe(handler1);
    });

    test("should distinguish between different HTTP methods", () => {
      const getHandler = jest.fn();
      const postHandler = jest.fn();
      router.get("/users", getHandler);
      router.post("/users", postHandler);

      const getMatch = router.findRoute("GET", "/users");
      const postMatch = router.findRoute("POST", "/users");

      expect(getMatch?.route.handler).toBe(getHandler);
      expect(postMatch?.route.handler).toBe(postHandler);
    });
  });

  describe("Request Handling", () => {
    test("should execute matched route handler", async () => {
      const handler = jest.fn();
      router.get("/users/:id", handler);

      const req = new Request("GET", "/users/123", {}, {}, {}, null);
      const res = new Response();

      await router.handleRequest(req, res);

      expect(handler).toHaveBeenCalledWith(req, res);
    });

    test("should add extracted params to request", async () => {
      const handler = jest.fn();
      router.get("/users/:id", handler);

      const req = new Request("GET", "/users/123", {}, {}, {}, null);
      const res = new Response();

      await router.handleRequest(req, res);

      expect(req.params.id).toBe("123");
    });

    test("should return 404 for unmatched route", async () => {
      const req = new Request("GET", "/unknown", {}, {}, {}, null);
      const res = new Response();

      await router.handleRequest(req, res);

      expect(res.getStatusCode()).toBe(404);
    });

    test("should handle async route handlers", async () => {
      const handler = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      router.get("/users", handler);

      const req = new Request("GET", "/users", {}, {}, {}, null);
      const res = new Response();

      await router.handleRequest(req, res);

      expect(handler).toHaveBeenCalled();
    });

    test("should catch and handle errors in route handler", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const handler = jest.fn(() => {
        throw new Error("Test error");
      });
      router.get("/users", handler);

      const req = new Request("GET", "/users", {}, {}, {}, null);
      const res = new Response();

      await router.handleRequest(req, res);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.getStatusCode()).toBe(500);

      consoleErrorSpy.mockRestore();
    });

    test("should handle multiple parameters in request", async () => {
      const handler = jest.fn();
      router.get("/users/:userId/posts/:postId", handler);

      const req = new Request("GET", "/users/123/posts/456", {}, {}, {}, null);
      const res = new Response();

      await router.handleRequest(req, res);

      expect(req.params.userId).toBe("123");
      expect(req.params.postId).toBe("456");
    });
  });

  describe("Helper Methods", () => {
    test("should return copy of routes array", () => {
      router.get("/users", jest.fn());
      router.post("/posts", jest.fn());

      const routes = router.getRoutes();

      expect(routes).toHaveLength(2);
      // Should be a copy, not the original array
      routes.push({} as any);
      expect(router.getRoutes()).toHaveLength(2);
    });

    test("should clear all routes", () => {
      router.get("/users", jest.fn());
      router.post("/posts", jest.fn());

      expect(router.getRoutes()).toHaveLength(2);

      router.clearRoutes();

      expect(router.getRoutes()).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    test("should handle root path", () => {
      const handler = jest.fn();
      router.get("/", handler);

      const match = router.findRoute("GET", "/");

      expect(match).not.toBeNull();
      expect(match?.params).toEqual({});
    });

    test("should handle paths with special characters in static segments", () => {
      const handler = jest.fn();
      router.get("/api/v1/users", handler);

      const match = router.findRoute("GET", "/api/v1/users");

      expect(match).not.toBeNull();
    });

    test("should handle numeric parameter values", () => {
      const handler = jest.fn();
      router.get("/users/:id", handler);

      const match = router.findRoute("GET", "/users/12345");

      expect(match).not.toBeNull();
      expect(match?.params.id).toBe("12345");
    });

    test("should handle alphanumeric parameter values", () => {
      const handler = jest.fn();
      router.get("/users/:id", handler);

      const match = router.findRoute("GET", "/users/abc123def");

      expect(match).not.toBeNull();
      expect(match?.params.id).toBe("abc123def");
    });

    test("should not match parameter across slashes", () => {
      router.get("/users/:id", jest.fn());

      const match = router.findRoute("GET", "/users/123/extra");

      expect(match).toBeNull();
    });
  });
});

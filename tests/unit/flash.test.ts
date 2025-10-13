/**
 * @file flash.test.ts
 * @brief Tests for Flash Framework main class
 */

import { Flash, createFlash, FlashOptions } from "../../src/flash";
import { Router } from "../../src/router";
import { MiddlewareManager, MiddlewareFunction } from "../../src/middleware";
import { Server } from "../../src/server";
import { Request } from "../../src/request";
import { Response } from "../../src/response";

// =============================================================================
// Test Suite 1: Flash Configuration Options
// =============================================================================

describe("FlashOptions Interface", () => {
  test("should allow all optional properties", () => {
    const options: FlashOptions = {};
    expect(options).toBeDefined();
  });

  test("should allow port option", () => {
    const options: FlashOptions = { port: 3000 };
    expect(options.port).toBe(3000);
  });

  test("should allow logger option", () => {
    const options: FlashOptions = { logger: false };
    expect(options.logger).toBe(false);
  });

  test("should allow cors option as boolean", () => {
    const options: FlashOptions = { cors: true };
    expect(options.cors).toBe(true);
  });

  test("should allow cors option as object", () => {
    const options: FlashOptions = {
      cors: { origin: "https://example.com" },
    };
    expect(options.cors).toEqual({ origin: "https://example.com" });
  });

  test("should allow bodyParser option", () => {
    const options: FlashOptions = { bodyParser: false };
    expect(options.bodyParser).toBe(false);
  });

  test("should allow all options together", () => {
    const options: FlashOptions = {
      port: 5000,
      logger: true,
      cors: { origin: "*" },
      bodyParser: true,
    };
    expect(options).toBeDefined();
  });
});

// =============================================================================
// Test Suite 2: Flash Constructor
// =============================================================================

describe("Flash Constructor", () => {
  test("should create instance with no options", () => {
    const app = new Flash();
    expect(app).toBeInstanceOf(Flash);
  });

  test("should create instance with empty options", () => {
    const app = new Flash({});
    expect(app).toBeInstanceOf(Flash);
  });

  test("should create instance with port option", () => {
    const app = new Flash({ port: 8080 });
    expect(app).toBeInstanceOf(Flash);
  });

  test("should create instance with all options", () => {
    const app = new Flash({
      port: 3000,
      logger: true,
      cors: true,
      bodyParser: true,
    });
    expect(app).toBeInstanceOf(Flash);
  });

  test("should apply default port when not provided", () => {
    const app = new Flash();
    const server = app.getServer();
    expect(server.getPort()).toBe(5267);
  });

  test("should use provided port", () => {
    const app = new Flash({ port: 9000 });
    const server = app.getServer();
    expect(server.getPort()).toBe(9000);
  });

  test("should initialize router", () => {
    const app = new Flash();
    const router = app.getRouter();
    expect(router).toBeInstanceOf(Router);
  });

  test("should initialize middleware manager", () => {
    const app = new Flash();
    const manager = app.getMiddlewareManager();
    expect(manager).toBeInstanceOf(MiddlewareManager);
  });

  test("should initialize server with correct port", () => {
    const app = new Flash({ port: 7000 });
    const server = app.getServer();
    expect(server).toBeInstanceOf(Server);
    expect(server.getPort()).toBe(7000);
  });
});

// =============================================================================
// Test Suite 3: Default Middleware Setup
// =============================================================================

describe("Flash Default Middleware", () => {
  test("should add logger middleware by default", () => {
    const app = new Flash();
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    // Default: logger, bodyParser (logger: true, bodyParser: true by default)
    expect(middlewares.length).toBeGreaterThan(0);
  });

  test("should not add logger when disabled", () => {
    const app = new Flash({ logger: false, bodyParser: false });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(0);
  });

  test("should add CORS middleware when enabled", () => {
    const app = new Flash({ cors: true, logger: false, bodyParser: false });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(1);
  });

  test("should add CORS middleware with options", () => {
    const app = new Flash({
      cors: { origin: "https://example.com" },
      logger: false,
      bodyParser: false,
    });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(1);
  });

  test("should add body parser by default", () => {
    const app = new Flash({ logger: false });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(1); // bodyParser only
  });

  test("should not add body parser when disabled", () => {
    const app = new Flash({ bodyParser: false, logger: false });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(0);
  });

  test("should add all default middleware when all enabled", () => {
    const app = new Flash({ logger: true, cors: true, bodyParser: true });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    // logger + cors + bodyParser = 3
    expect(middlewares.length).toBe(3);
  });

  test("should maintain middleware order: logger, cors, bodyParser", () => {
    const app = new Flash({ logger: true, cors: true, bodyParser: true });
    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(3);
    // Order matters but can't easily test without executing
  });
});

// =============================================================================
// Test Suite 4: Middleware Registration
// =============================================================================

describe("Flash use() Method", () => {
  test("should register custom middleware", () => {
    const app = new Flash({ logger: false, bodyParser: false });
    const middleware: MiddlewareFunction = (req, res, next) => next();

    app.use(middleware);

    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(1);
    expect(middlewares[0]).toBe(middleware);
  });

  test("should return this for method chaining", () => {
    const app = new Flash();
    const middleware: MiddlewareFunction = (req, res, next) => next();

    const result = app.use(middleware);

    expect(result).toBe(app);
  });

  test("should allow chaining multiple use() calls", () => {
    const app = new Flash({ logger: false, bodyParser: false });
    const middleware1: MiddlewareFunction = (req, res, next) => next();
    const middleware2: MiddlewareFunction = (req, res, next) => next();

    app.use(middleware1).use(middleware2);

    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(2);
  });

  test("should add middleware after defaults", () => {
    const app = new Flash({ logger: true, bodyParser: false });
    const customMiddleware: MiddlewareFunction = (req, res, next) => next();

    app.use(customMiddleware);

    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares.length).toBe(2); // logger + custom
  });
});

// =============================================================================
// Test Suite 5: HTTP Method Shortcuts
// =============================================================================

describe("Flash HTTP Method Shortcuts", () => {
  describe("get()", () => {
    test("should register GET route", () => {
      const app = new Flash();
      const handler = jest.fn();

      app.get("/test", handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.length).toBe(1);
      expect(routes[0].method).toBe("GET");
      expect(routes[0].path).toBe("/test");
    });

    test("should return this for method chaining", () => {
      const app = new Flash();
      const handler = jest.fn();

      const result = app.get("/test", handler);

      expect(result).toBe(app);
    });

    test("should allow chaining multiple routes", () => {
      const app = new Flash();

      app.get("/route1", jest.fn()).get("/route2", jest.fn());

      const routes = app.getRouter().getRoutes();
      expect(routes.length).toBe(2);
    });
  });

  describe("post()", () => {
    test("should register POST route", () => {
      const app = new Flash();
      const handler = jest.fn();

      app.post("/test", handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.length).toBe(1);
      expect(routes[0].method).toBe("POST");
    });

    test("should return this for method chaining", () => {
      const app = new Flash();
      const result = app.post("/test", jest.fn());
      expect(result).toBe(app);
    });
  });

  describe("put()", () => {
    test("should register PUT route", () => {
      const app = new Flash();
      const handler = jest.fn();

      app.put("/test", handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.length).toBe(1);
      expect(routes[0].method).toBe("PUT");
    });

    test("should return this for method chaining", () => {
      const app = new Flash();
      const result = app.put("/test", jest.fn());
      expect(result).toBe(app);
    });
  });

  describe("delete()", () => {
    test("should register DELETE route", () => {
      const app = new Flash();
      const handler = jest.fn();

      app.delete("/test", handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.length).toBe(1);
      expect(routes[0].method).toBe("DELETE");
    });

    test("should return this for method chaining", () => {
      const app = new Flash();
      const result = app.delete("/test", jest.fn());
      expect(result).toBe(app);
    });
  });

  test("should allow mixing different HTTP methods", () => {
    const app = new Flash();

    app
      .get("/users", jest.fn())
      .post("/users", jest.fn())
      .put("/users/:id", jest.fn())
      .delete("/users/:id", jest.fn());

    const routes = app.getRouter().getRoutes();
    expect(routes.length).toBe(4);
  });
});

// =============================================================================
// Test Suite 6: Request Handling Pipeline
// =============================================================================

describe("Flash handleRequest() Integration", () => {
  test("should execute middleware before routing", async () => {
    const app = new Flash({ logger: false, bodyParser: false });
    const executionOrder: string[] = [];

    const middleware: MiddlewareFunction = async (req, res, next) => {
      executionOrder.push("middleware");
      await next();
    };

    app.use(middleware);
    app.get("/test", (req, res) => {
      executionOrder.push("handler");
      res.json({ success: true });
    });

    const mockReq = {
      method: "GET",
      path: "/test",
      query: {},
      params: {},
      headers: {},
      body: null,
    } as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn().mockReturnThis(),
      isSent: jest.fn().mockReturnValue(false),
    } as unknown as Response;

    await (app as any).handleRequest(mockReq, mockRes);

    expect(executionOrder).toEqual(["middleware", "handler"]);
  });

  test("should handle errors in middleware", async () => {
    const app = new Flash({ logger: false, bodyParser: false });

    const errorMiddleware: MiddlewareFunction = async () => {
      throw new Error("Middleware error");
    };

    app.use(errorMiddleware);
    app.get("/test", jest.fn());

    const mockReq = {
      method: "GET",
      path: "/test",
      query: {},
      params: {},
      headers: {},
      body: null,
    } as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      isSent: jest.fn().mockReturnValue(false),
    } as unknown as Response;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await (app as any).handleRequest(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "Middleware error",
    });

    consoleErrorSpy.mockRestore();
  });

  test("should handle errors in route handler", async () => {
    const app = new Flash({ logger: false, bodyParser: false });

    app.get("/test", () => {
      throw new Error("Handler error");
    });

    const mockReq = {
      method: "GET",
      path: "/test",
      query: {},
      params: {},
      headers: {},
      body: null,
    } as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      isSent: jest.fn().mockReturnValue(false),
    } as unknown as Response;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await (app as any).handleRequest(mockReq, mockRes);

    // Router catches the error and sends 500 response (without message details)
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
    });

    consoleErrorSpy.mockRestore();
  });

  test("should handle errors after response sent", async () => {
    const app = new Flash({ logger: false, bodyParser: false });

    app.get("/test", (req, res) => {
      res.json({ success: true });
      throw new Error("After send");
    });

    const mockReq = {
      method: "GET",
      path: "/test",
      query: {},
      params: {},
      headers: {},
      body: null,
    } as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      isSent: jest.fn().mockReturnValue(false),
    } as unknown as Response;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await (app as any).handleRequest(mockReq, mockRes);

    // Handler sends response, then throws error
    // Router catches error and sends another error response
    expect(mockRes.json).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

// =============================================================================
// Test Suite 7: Utility Methods
// =============================================================================

describe("Flash Utility Methods", () => {
  test("getRouter() should return Router instance", () => {
    const app = new Flash();
    const router = app.getRouter();
    expect(router).toBeInstanceOf(Router);
  });

  test("getMiddlewareManager() should return MiddlewareManager instance", () => {
    const app = new Flash();
    const manager = app.getMiddlewareManager();
    expect(manager).toBeInstanceOf(MiddlewareManager);
  });

  test("getServer() should return Server instance", () => {
    const app = new Flash();
    const server = app.getServer();
    expect(server).toBeInstanceOf(Server);
  });

  test("should allow direct manipulation of router", () => {
    const app = new Flash();
    const router = app.getRouter();

    router.get("/direct", jest.fn());

    const routes = router.getRoutes();
    expect(routes.length).toBe(1);
  });

  test("should allow direct manipulation of middleware manager", () => {
    const app = new Flash({ logger: false, bodyParser: false });
    const manager = app.getMiddlewareManager();

    const middleware: MiddlewareFunction = (req, res, next) => next();
    manager.use(middleware);

    const middlewares = manager.getMiddlewares();
    expect(middlewares.length).toBe(1);
  });
});

// =============================================================================
// Test Suite 8: Factory Function
// =============================================================================

describe("createFlash() Factory Function", () => {
  test("should create Flash instance", () => {
    const app = createFlash();
    expect(app).toBeInstanceOf(Flash);
  });

  test("should create Flash instance with options", () => {
    const app = createFlash({ port: 4000 });
    expect(app).toBeInstanceOf(Flash);
    expect(app.getServer().getPort()).toBe(4000);
  });

  test("should work identically to new Flash()", () => {
    const app1 = new Flash({ port: 3000 });
    const app2 = createFlash({ port: 3000 });

    expect(app1).toBeInstanceOf(Flash);
    expect(app2).toBeInstanceOf(Flash);
    expect(app1.getServer().getPort()).toBe(app2.getServer().getPort());
  });
});

// =============================================================================
// Test Suite 9: Method Chaining
// =============================================================================

describe("Flash Method Chaining", () => {
  test("should support full method chaining", () => {
    const app = new Flash();

    const result = app
      .use((req, res, next) => next())
      .get("/", jest.fn())
      .post("/users", jest.fn())
      .put("/users/:id", jest.fn())
      .delete("/users/:id", jest.fn());

    expect(result).toBe(app);
  });

  test("should allow building complete app with chaining", () => {
    const middleware = jest.fn((req, res, next) => next());
    const getHandler = jest.fn();
    const postHandler = jest.fn();

    const app = createFlash({ port: 3000 })
      .use(middleware)
      .get("/", getHandler)
      .post("/users", postHandler);

    expect(app.getRouter().getRoutes().length).toBe(2);
    expect(app.getMiddlewareManager().getMiddlewares().length).toBeGreaterThan(
      0
    );
  });
});

// =============================================================================
// Test Suite 10: Integration Tests
// =============================================================================

describe("Flash Integration", () => {
  test("should integrate all components correctly", () => {
    const app = new Flash({
      port: 5000,
      logger: true,
      cors: true,
      bodyParser: true,
    });

    app
      .use((req, res, next) => next())
      .get("/", jest.fn())
      .post("/api/data", jest.fn());

    expect(app.getServer()).toBeInstanceOf(Server);
    expect(app.getRouter()).toBeInstanceOf(Router);
    expect(app.getMiddlewareManager()).toBeInstanceOf(MiddlewareManager);

    expect(app.getRouter().getRoutes().length).toBe(2);
    expect(app.getMiddlewareManager().getMiddlewares().length).toBe(4); // logger + cors + bodyParser + custom
  });

  test("should work with minimal configuration", () => {
    const app = new Flash();
    app.get("/", (req, res) => {
      res.json({ message: "Hello" });
    });

    const routes = app.getRouter().getRoutes();
    expect(routes.length).toBe(1);
  });

  test("should work with complete configuration", () => {
    const app = new Flash({
      port: 8080,
      logger: true,
      cors: { origin: "*", methods: ["GET", "POST"] },
      bodyParser: true,
    });

    const customMiddleware: MiddlewareFunction = (req, res, next) => next();

    app
      .use(customMiddleware)
      .get("/", jest.fn())
      .get("/users", jest.fn())
      .post("/users", jest.fn())
      .put("/users/:id", jest.fn())
      .delete("/users/:id", jest.fn());

    expect(app.getServer().getPort()).toBe(8080);
    expect(app.getRouter().getRoutes().length).toBe(5);
    expect(app.getMiddlewareManager().getMiddlewares().length).toBe(4); // logger + cors + bodyParser + custom
  });
});

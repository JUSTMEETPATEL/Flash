import {
  NextFunction,
  MiddlewareFunction,
  MiddlewareManager,
  createLoggerMiddleware,
  createCorsMiddleware,
  createJsonBodyParser,
  createErrorHandler,
  CorsOptions,
} from "../../src/middleware";
import { Request } from "../../src/request";
import { Response } from "../../src/response";

describe("Middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      path: "/test",
      headers: {},
      query: {},
      params: {},
      body: null,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Type Definitions", () => {
    test("NextFunction type accepts sync function", () => {
      const next: NextFunction = () => {};
      expect(typeof next).toBe("function");
    });

    test("NextFunction type accepts async function", () => {
      const next: NextFunction = async () => {};
      expect(typeof next).toBe("function");
    });

    test("MiddlewareFunction type accepts valid middleware", () => {
      const middleware: MiddlewareFunction = (req, res, next) => {
        next();
      };
      expect(typeof middleware).toBe("function");
    });

    test("MiddlewareFunction type accepts async middleware", () => {
      const middleware: MiddlewareFunction = async (req, res, next) => {
        await Promise.resolve();
        next();
      };
      expect(typeof middleware).toBe("function");
    });
  });

  describe("MiddlewareManager", () => {
    let manager: MiddlewareManager;

    beforeEach(() => {
      manager = new MiddlewareManager();
    });

    describe("use()", () => {
      test("registers a middleware function", () => {
        const middleware: MiddlewareFunction = jest.fn();
        manager.use(middleware);

        const middlewares = manager.getMiddlewares();
        expect(middlewares).toHaveLength(1);
        expect(middlewares[0]).toBe(middleware);
      });

      test("registers multiple middleware functions in order", () => {
        const middleware1: MiddlewareFunction = jest.fn();
        const middleware2: MiddlewareFunction = jest.fn();
        const middleware3: MiddlewareFunction = jest.fn();

        manager.use(middleware1);
        manager.use(middleware2);
        manager.use(middleware3);

        const middlewares = manager.getMiddlewares();
        expect(middlewares).toHaveLength(3);
        expect(middlewares[0]).toBe(middleware1);
        expect(middlewares[1]).toBe(middleware2);
        expect(middlewares[2]).toBe(middleware3);
      });
    });

    describe("execute()", () => {
      test("executes middleware in order", async () => {
        const order: number[] = [];

        manager.use((req, res, next) => {
          order.push(1);
          next();
        });
        manager.use((req, res, next) => {
          order.push(2);
          next();
        });
        manager.use((req, res, next) => {
          order.push(3);
          next();
        });

        await manager.execute(mockReq, mockRes);

        expect(order).toEqual([1, 2, 3]);
      });

      test("stops execution if next() not called", async () => {
        const order: number[] = [];

        manager.use((req, res, next) => {
          order.push(1);
          next();
        });
        manager.use((req, res, next) => {
          order.push(2);
          // Don't call next()
        });
        manager.use((req, res, next) => {
          order.push(3); // Should not execute
          next();
        });

        await manager.execute(mockReq, mockRes);

        expect(order).toEqual([1, 2]);
      });

      test("handles async middleware", async () => {
        const order: number[] = [];

        manager.use(async (req, res, next) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          order.push(1);
          await next();
        });
        manager.use(async (req, res, next) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          order.push(2);
          await next();
        });

        await manager.execute(mockReq, mockRes);

        expect(order).toEqual([1, 2]);
      });

      test("allows middleware to modify request", async () => {
        manager.use((req, res, next) => {
          (req as any).customProp = "test";
          next();
        });
        manager.use((req, res, next) => {
          expect((req as any).customProp).toBe("test");
          next();
        });

        await manager.execute(mockReq, mockRes);
      });

      test("allows middleware to send response and stop chain", async () => {
        const order: number[] = [];

        manager.use((req, res, next) => {
          order.push(1);
          res.status(401).json({ error: "Unauthorized" });
          // Don't call next()
        });
        manager.use((req, res, next) => {
          order.push(2); // Should not execute
          next();
        });

        await manager.execute(mockReq, mockRes);

        expect(order).toEqual([1]);
        expect(mockRes.status).toHaveBeenCalledWith(401);
      });

      test("handles empty middleware array", async () => {
        await expect(manager.execute(mockReq, mockRes)).resolves.not.toThrow();
      });

      test("executes middleware with correct context", async () => {
        manager.use((req, res, next) => {
          expect(req).toBe(mockReq);
          expect(res).toBe(mockRes);
          next();
        });

        await manager.execute(mockReq, mockRes);
      });
    });

    describe("getMiddlewares()", () => {
      test("returns copy of middleware array", () => {
        const middleware: MiddlewareFunction = jest.fn();
        manager.use(middleware);

        const middlewares1 = manager.getMiddlewares();
        const middlewares2 = manager.getMiddlewares();

        expect(middlewares1).toEqual(middlewares2);
        expect(middlewares1).not.toBe(middlewares2); // Different arrays
      });

      test("returned array modification does not affect manager", () => {
        const middleware: MiddlewareFunction = jest.fn();
        manager.use(middleware);

        const middlewares = manager.getMiddlewares();
        middlewares.push(jest.fn());

        expect(manager.getMiddlewares()).toHaveLength(1);
      });
    });

    describe("clearMiddlewares()", () => {
      test("removes all middleware", () => {
        manager.use(jest.fn());
        manager.use(jest.fn());
        manager.use(jest.fn());

        expect(manager.getMiddlewares()).toHaveLength(3);

        manager.clearMiddlewares();

        expect(manager.getMiddlewares()).toHaveLength(0);
      });

      test("allows registering new middleware after clear", () => {
        manager.use(jest.fn());
        manager.clearMiddlewares();

        const newMiddleware: MiddlewareFunction = jest.fn();
        manager.use(newMiddleware);

        expect(manager.getMiddlewares()).toHaveLength(1);
        expect(manager.getMiddlewares()[0]).toBe(newMiddleware);
      });
    });
  });

  describe("createLoggerMiddleware", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("returns a middleware function", () => {
      const logger = createLoggerMiddleware();
      expect(typeof logger).toBe("function");
    });

    test("logs request method and path", async () => {
      const logger = createLoggerMiddleware();
      await logger(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("GET /test")
      );
    });

    test("logs with ISO timestamp", async () => {
      const logger = createLoggerMiddleware();
      await logger(mockReq, mockRes, mockNext);

      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
      );
    });

    test("calls next() after logging", async () => {
      const logger = createLoggerMiddleware();
      await logger(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test("logs different request types", async () => {
      const logger = createLoggerMiddleware();

      mockReq.method = "POST";
      mockReq.path = "/users";
      await logger(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("POST /users")
      );
    });
  });

  describe("createCorsMiddleware", () => {
    test("returns a middleware function", () => {
      const cors = createCorsMiddleware();
      expect(typeof cors).toBe("function");
    });

    test("sets default CORS headers", async () => {
      const cors = createCorsMiddleware();
      await cors(mockReq, mockRes, mockNext);

      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    });

    test("uses custom origin", async () => {
      const cors = createCorsMiddleware({ origin: "https://example.com" });
      await cors(mockReq, mockRes, mockNext);

      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "https://example.com"
      );
    });

    test("uses custom methods", async () => {
      const cors = createCorsMiddleware({ methods: ["GET", "POST"] });
      await cors(mockReq, mockRes, mockNext);

      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "GET, POST"
      );
    });

    test("uses custom allowed headers", async () => {
      const cors = createCorsMiddleware({
        allowedHeaders: ["X-Custom-Header"],
      });
      await cors(mockReq, mockRes, mockNext);

      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "X-Custom-Header"
      );
    });

    test("sets credentials header when enabled", async () => {
      const cors = createCorsMiddleware({ credentials: true });
      await cors(mockReq, mockRes, mockNext);

      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Credentials",
        "true"
      );
    });

    test("does not set credentials header when disabled", async () => {
      const cors = createCorsMiddleware({ credentials: false });
      await cors(mockReq, mockRes, mockNext);

      const calls = (mockRes.header as jest.Mock).mock.calls;
      const credentialsCall = calls.find(
        (call) => call[0] === "Access-Control-Allow-Credentials"
      );
      expect(credentialsCall).toBeUndefined();
    });

    test("calls next() after setting headers", async () => {
      const cors = createCorsMiddleware();
      await cors(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test("accepts empty options object", async () => {
      const cors = createCorsMiddleware({});
      await cors(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("createJsonBodyParser", () => {
    test("returns a middleware function", () => {
      const parser = createJsonBodyParser();
      expect(typeof parser).toBe("function");
    });

    test("parses JSON string body", async () => {
      const parser = createJsonBodyParser();
      mockReq.body = '{"name":"Alice","age":30}';

      await parser(mockReq, mockRes, mockNext);

      expect((mockReq as any).body).toEqual({ name: "Alice", age: 30 });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test("does not modify already parsed body", async () => {
      const parser = createJsonBodyParser();
      const bodyObject = { name: "Alice" };
      mockReq.body = bodyObject;

      await parser(mockReq, mockRes, mockNext);

      expect(mockReq.body).toBe(bodyObject);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test("handles invalid JSON", async () => {
      const parser = createJsonBodyParser();
      mockReq.body = "{invalid json}";

      await parser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid JSON" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("handles empty string body", async () => {
      const parser = createJsonBodyParser();
      mockReq.body = "";

      await parser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid JSON" });
    });

    test("handles null body", async () => {
      const parser = createJsonBodyParser();
      mockReq.body = null;

      await parser(mockReq, mockRes, mockNext);

      expect(mockReq.body).toBe(null);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test("handles complex JSON", async () => {
      const parser = createJsonBodyParser();
      const complexJson = {
        user: { name: "Alice", email: "alice@example.com" },
        posts: [
          { id: 1, title: "First post" },
          { id: 2, title: "Second post" },
        ],
      };
      mockReq.body = JSON.stringify(complexJson);

      await parser(mockReq, mockRes, mockNext);

      expect((mockReq as any).body).toEqual(complexJson);
    });

    test("handles array JSON", async () => {
      const parser = createJsonBodyParser();
      mockReq.body = "[1, 2, 3, 4, 5]";

      await parser(mockReq, mockRes, mockNext);

      expect((mockReq as any).body).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("createErrorHandler", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test("returns an error middleware function", () => {
      const errorHandler = createErrorHandler();
      expect(typeof errorHandler).toBe("function");
    });

    test("logs the error", () => {
      const errorHandler = createErrorHandler();
      const error = new Error("Test error");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
    });

    test("sends 500 status code", () => {
      const errorHandler = createErrorHandler();
      const error = new Error("Test error");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test("sends error response with message", () => {
      const errorHandler = createErrorHandler();
      const error = new Error("Test error");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Test error",
      });
    });

    test("handles errors with different messages", () => {
      const errorHandler = createErrorHandler();
      const error = new Error("Database connection failed");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Database connection failed",
      });
    });

    test("handles generic Error objects", () => {
      const errorHandler = createErrorHandler();
      const error = new Error();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe("Integration Tests", () => {
    test("middleware chain with logger and CORS", async () => {
      const manager = new MiddlewareManager();
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      manager.use(createLoggerMiddleware());
      manager.use(createCorsMiddleware());

      await manager.execute(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );

      consoleSpy.mockRestore();
    });

    test("middleware chain with body parser", async () => {
      const manager = new MiddlewareManager();
      mockReq.body = '{"test":"data"}';

      manager.use(createJsonBodyParser());

      await manager.execute(mockReq, mockRes);

      expect((mockReq as any).body).toEqual({ test: "data" });
    });

    test("middleware chain stops on response", async () => {
      const manager = new MiddlewareManager();
      const order: number[] = [];

      manager.use((req, res, next) => {
        order.push(1);
        next();
      });
      manager.use((req, res, next) => {
        order.push(2);
        res.status(200).json({ success: true });
        // Don't call next()
      });
      manager.use((req, res, next) => {
        order.push(3); // Should not execute
        next();
      });

      await manager.execute(mockReq, mockRes);

      expect(order).toEqual([1, 2]);
    });
  });
});

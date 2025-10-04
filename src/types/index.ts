export interface Request {
  method: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: any;
}

export interface Response {
  status(code: number): Response;
  json(data: any): void;
  send(data: string): void;
  end(): void;
}

export interface RouteHandler {
  (req: Request, res: Response): void | Promise<void>;
}

export interface FlashOptions {
  workers?: number;
  port?: number;
}
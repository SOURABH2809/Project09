export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  data?: any;

  constructor(message: string, statusCode = 400, code?: string, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.data = data;
  }
}

//src\types\api.types.ts
export interface ApiResponse<T = any> {
  data?: T | null;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
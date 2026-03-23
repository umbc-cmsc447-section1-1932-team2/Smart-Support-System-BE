export interface ApiResponse<T = any> {
  message: string;
  data: T;
}
export function sendResponse<T>(message: string, data: T): ApiResponse<T> {
  return { message, data };
}

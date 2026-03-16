export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PageParams {
  page: number;
  limit: number;
}

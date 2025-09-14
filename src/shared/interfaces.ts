export interface HttpResponse<T = any> {
  success?: boolean;
  code?: number;
  httpCode?: number;
  message?: string;
  data?: T;
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
  httpCode?: number;
  metadata?: any;
  action?: string;
}

export interface MessageKey {
  code: number;
  message: string;
}

export interface PaginationResult<T = any> {
  rows: T[];
  total: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

export interface CrudOptions {
  include?: any;
  select?: any;
  orderBy?: any;
  withDeleted?: boolean;
  skipDuplicates?: boolean;
}

export interface CrudServiceOpts {
  model: string;
}

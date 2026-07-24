/**
 * NexusCRM Developer REST API v1 Data Contracts & Types
 */

/**
 * Standardized pagination metadata returned in REST list responses.
 */
export interface PaginationMeta {
  /** Current page index (1-based) */
  page: number;
  /** Items returned per page limit */
  limit: number;
  /** Total matching records count in database */
  total: number;
  /** Total available page count */
  totalPages: number;
}

/**
 * Standardized envelope wrapper returned by all v1 API endpoints.
 */
export interface ApiResponse<T> {
  /** Execution status flag */
  success: boolean;
  /** Target response data payload */
  data?: T;
  /** Optional pagination metadata for list endpoints */
  meta?: PaginationMeta;
  /** Error message string if success is false */
  error?: string;
  /** ISO timestamp of request completion */
  timestamp: string;
}

/**
 * Standardized error payload structure returned on HTTP 4xx/5xx responses.
 */
export interface ApiError {
  /** HTTP Status Code (401, 403, 404, 500) */
  statusCode: number;
  /** Readable error summary description */
  message: string;
  /** Optional granular field error map */
  details?: Record<string, string[]>;
}

/**
 * Available granular scope permission strings for API Keys.
 */
export type ApiPermission =
  | "read:customers"
  | "write:customers"
  | "delete:customers"
  | "read:leads"
  | "write:leads"
  | "delete:leads"
  | "read:tasks"
  | "write:tasks"
  | "delete:tasks"
  | "read:reports"
  | "execute:reports";

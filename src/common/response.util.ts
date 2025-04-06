export interface ResponseMeta {
  statusCode: number;
  message: string;
  timestamp?: string;
  success: boolean;
}

export function buildResponse<T>(
  data: T,
  message: string,
  statusCode: number,
): { meta: ResponseMeta; data: T } {
  return {
    meta: {
      statusCode,
      message,
      timestamp: Date.now().toString(),
      success: statusCode >= 200 && statusCode < 300,
    },
    data,
  };
}

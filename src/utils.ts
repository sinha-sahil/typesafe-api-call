import { ErrorDetails } from './types';

export async function generateRawResponse(apiResponse: Response): Promise<unknown> {
  let result = null;
  const contentType = apiResponse.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    result = await apiResponse.json();
  } else {
    result = await apiResponse.text();
  }
  return result;
}

export function getErrorDetails(err: unknown): ErrorDetails {
  if (err instanceof DOMException) {
    return {
      class: 'DOMException',
      name: err.name,
      message: err.message,
      cause: err.cause,
      stack: err.stack ?? null
    };
  } else if (err instanceof TypeError) {
    return {
      class: 'TypeError',
      name: err.name,
      message: err.message,
      cause: err.cause,
      stack: err.stack ?? null
    };
  } else if (err instanceof Error) {
    return {
      class: err.name,
      name: err.name,
      message: err.message,
      cause: JSON.stringify(err),
      stack: err.stack ?? null
    };
  } else {
    return {
      class: 'UnhandledException',
      name: 'UnhandledException',
      message: null,
      cause: JSON.stringify(err),
      stack: null
    };
  }
}

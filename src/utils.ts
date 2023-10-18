import { isJSON } from 'type-decoder';
import { JSONObject } from 'type-decoder/types';

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

export function getErrorDetails(err: unknown): JSONObject {
  if (err instanceof DOMException) {
    return {
      class: 'DOMException',
      code: err.name,
      message: err.message,
      additionalInfo: isJSON(err.cause) ? err.cause : null
    };
  } else if (err instanceof TypeError) {
    let cause = 'Unknown Error';
    if (err !== null && err.cause !== undefined) {
      cause = JSON.stringify(err.cause);
    }
    delete err.cause;
    const additionalInfo = JSON.stringify(err);
    return {
      class: 'TypeError',
      code: err.name,
      message: cause,
      additionalInfo: additionalInfo
    };
  } else if (err instanceof Error) {
    return {
      class: err.name,
      code: err.name,
      message: err.message,
      additionalInfo: JSON.stringify(err),
      stack: err.stack ?? null
    };
  } else {
    return {
      class: 'Unknown',
      additionalInfo: JSON.stringify(err)
    };
  }
}

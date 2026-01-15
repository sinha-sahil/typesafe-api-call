# Type safe API Caller

A minimalistic TypeScript/JavaScript library for making type-safe API calls using a functional approach. Every API call returns either an `APISuccess` or `APIFailure` result - no exceptions to catch, just two clear outcomes to handle.

## Features

- **Type-safe responses** - Discriminated union pattern ensures compile-time safety
- **No exception handling** - API calls never throw; always return success or failure
- **Retry support** - Built-in retry mechanism with configurable intervals and error filtering
- **Hook system** - Register callbacks for request start, end, and retry events
- **Response time tracking** - Every response includes execution time in milliseconds
- **Custom fetch support** - Override the native fetch with your own implementation

## Installation

```bash
npm install typesafe-api-call
```

## Quick Start

```typescript
import { APICaller, APIResponse, type APIRequest, APISuccess } from 'typesafe-api-call';

async function getUser(id: number): Promise<APIResponse<User, unknown>> {
  const apiRequest: APIRequest = {
    url: new URL(`https://api.example.com/users/${id}`),
    method: 'GET'
  };

  return APICaller.call(apiRequest, (response: unknown) => {
    // Return decoded User or null if decoding fails
    return decodeUser(response);
  });
}

const result = await getUser(1);

if (result instanceof APISuccess) {
  console.log(result.response); // Type-safe User object
} else {
  console.log(result.errorMessage); // Handle failure
}
```

## API Reference

### APICaller.call()

Makes a single API call and returns a typed response.

```typescript
APICaller.call<SuccessResponse, ErrorResponse>(
  apiRequest: APIRequest,
  responseDecoder: ResponseDecoder<SuccessResponse>,
  errorResponseDecoder?: ResponseDecoder<ErrorResponse> | null,
  apiCaller?: FetchType
): Promise<APIResponse<SuccessResponse, ErrorResponse>>
```

**Parameters:**

- `apiRequest` - Request configuration (url, method, headers, body, etc.)
- `responseDecoder` - Function to decode successful responses. Returns decoded value or `null` if decoding fails
- `errorResponseDecoder` - Optional function to decode error responses
- `apiCaller` - Optional custom fetch implementation

### APICaller.callWithRetries()

Makes an API call with automatic retry on failure.

```typescript
APICaller.callWithRetries<SuccessResponse, ErrorResponse>(
  apiRequest: APIRequest,
  responseDecoder: ResponseDecoder<SuccessResponse>,
  retryConfig: RetryConfig,
  errorResponseDecoder?: ResponseDecoder<ErrorResponse> | null,
  apiCaller?: FetchType
): Promise<APIResponse<SuccessResponse, ErrorResponse>>
```

**RetryConfig:**

```typescript
type RetryConfig = {
  maxRetries: number;      // Number of retry attempts
  retryInterval: number;   // Delay between retries in milliseconds
  retryOn: ErrorClass[];   // Error types that trigger a retry
};
```

**Example:**

```typescript
const response = await APICaller.callWithRetries(
  apiRequest,
  responseDecoder,
  {
    maxRetries: 3,
    retryInterval: 2000,
    retryOn: ['DOMException', 'TypeError', 'Error']
  }
);
```

### APIRequest

Extends the native `RequestInit` interface with required fields:

```typescript
interface APIRequest extends RequestInit {
  url: URL;                           // Required: Request URL
  method: HttpMethod;                 // Required: HTTP method
  agent?: unknown;                    // Optional: For node-fetch compatibility
  // ...plus all standard RequestInit options (headers, body, credentials, etc.)
}
```

**Supported HTTP Methods:** `GET`, `HEAD`, `POST`, `PUT`, `DELETE`, `PATCH`

### APISuccess

Returned when the API call succeeds and response decoding is successful.

```typescript
class APISuccess<T> {
  readonly statusCode: number;  // HTTP status code (e.g., 200)
  readonly status: string;      // HTTP status text (e.g., "OK")
  readonly response: T;         // Decoded response body
  readonly time: number;        // Response time in milliseconds
}
```

### APIFailure

Returned when the API call fails or response decoding fails.

```typescript
class APIFailure<E> {
  readonly errorMessage: string;       // Error description
  readonly errorCode: number;          // HTTP status code (-1 for exceptions)
  readonly response: E | null;         // Decoded error response (if decoder provided)
  readonly errorResponse: unknown;     // Raw error response
  readonly errorDetails: ErrorDetails | null;  // Detailed error info
  readonly time: number;               // Response time in milliseconds
}
```

### ErrorDetails

Provides detailed information about errors encountered during API calls.

```typescript
type ErrorDetails = {
  class: ErrorClass;          // Error classification
  name: string;               // Error name
  message: string | null;     // Error message
  cause: unknown;             // Error cause
  stack: string | null;       // Stack trace
};

type ErrorClass =
  | 'DOMException'        // Network/abort errors
  | 'TypeError'           // Invalid request/URL errors
  | 'DecodeFailure'       // Response decoding failed
  | 'InternalError'       // Internal errors
  | 'Error'               // General errors
  | 'UnhandledException'; // Unexpected errors
```

## Hooks

Register callbacks to observe API call lifecycle events. Each hook requires a unique `id` to prevent duplicate registrations.

### Start Hook

Triggered before an API call begins.

```typescript
APICaller.registerStartHook({
  id: 'my-start-hook',
  func: (apiRequest: APIRequest) => {
    console.log(`Starting: ${apiRequest.method} ${apiRequest.url.href}`);
  }
});
```

### End Hook

Triggered after an API call completes (success or failure).

```typescript
APICaller.registerEndHook({
  id: 'my-end-hook',
  func: (apiRequest: APIRequest, response: APIResponse<unknown, unknown>) => {
    const time = response instanceof APISuccess ? response.time : response.time;
    console.log(`Completed in ${time}ms`);
  }
});
```

### Retry Hook

Triggered when a retry attempt is made (only with `callWithRetries`).

```typescript
APICaller.registerRetryHook({
  id: 'my-retry-hook',
  func: (apiRequest: APIRequest, response: APIResponse<unknown, unknown>, attempt: number) => {
    console.log(`Retry attempt #${attempt}`);
  }
});
```

## Response Decoder Pattern

The `ResponseDecoder` function validates and transforms raw API responses into typed objects:

```typescript
type ResponseDecoder<T> = (rawResponse: unknown) => T | null;
```

- Return the decoded value on success
- Return `null` if decoding/validation fails (triggers `APIFailure` with `DecodeFailure` error class)

This pattern integrates well with validation libraries like [type-decoder](https://www.npmjs.com/package/type-decoder).

## Examples

### GET Request

```typescript
async function getAllPosts(): Promise<APIResponse<Post[], unknown>> {
  const apiRequest: APIRequest = {
    url: new URL('https://api.example.com/posts'),
    method: 'GET'
  };
  return APICaller.call(apiRequest, (response: unknown) => {
    return decodeArray(response, decodePost);
  });
}
```

### POST Request

```typescript
async function createPost(post: Post): Promise<APIResponse<CreatePostResponse, unknown>> {
  const apiRequest: APIRequest = {
    url: new URL('https://api.example.com/posts'),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  };
  return APICaller.call(apiRequest, decodeCreatePostResponse);
}
```

### With Error Response Decoder

```typescript
const response = await APICaller.call(
  apiRequest,
  decodeSuccessResponse,  // Decode success response
  decodeErrorResponse     // Decode error response if success decoding fails
);

if (response instanceof APISuccess) {
  // response.response is typed as SuccessType
} else {
  // response.response is typed as ErrorType | null
}
```

## Handling APIFailure

When an API call fails, you receive an `APIFailure` instance. Here's how to interpret and handle different failure scenarios:

### Understanding Failure Types

```typescript
import { APICaller, APISuccess, APIFailure, type APIRequest } from 'typesafe-api-call';

const result = await APICaller.call(apiRequest, decodeUser);

if (result instanceof APIFailure) {
  // Check what type of error occurred
  const errorClass = result.errorDetails?.class;

  switch (errorClass) {
    case 'DOMException':
      // Network error, request aborted, or CORS issue
      console.log('Network error:', result.errorDetails?.message);
      break;

    case 'TypeError':
      // Invalid URL or request configuration
      console.log('Invalid request:', result.errorDetails?.message);
      break;

    case 'DecodeFailure':
      // Response received but decoder returned null
      // The raw response is available for inspection
      console.log('Failed to decode response:', result.errorResponse);
      break;

    case 'InternalError':
    case 'Error':
    case 'UnhandledException':
      // Other runtime errors
      console.log('Unexpected error:', result.errorDetails?.message);
      break;

    default:
      // HTTP error (4xx, 5xx) - errorDetails may be null
      console.log(`HTTP ${result.errorCode}:`, result.errorMessage);
  }
}
```

### Using Typed Error Decoders

For APIs that return structured error responses, use an error decoder to get typed error handling:

```typescript
// Define your API's error response structure
type APIErrorResponse = {
  code: string;
  message: string;
  details?: string[];
};

// Create a decoder for the error response
function decodeAPIError(raw: unknown): APIErrorResponse | null {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'code' in raw &&
    'message' in raw &&
    typeof (raw as APIErrorResponse).code === 'string' &&
    typeof (raw as APIErrorResponse).message === 'string'
  ) {
    return raw as APIErrorResponse;
  }
  return null;
}

// Use both success and error decoders
async function createUser(userData: UserInput): Promise<User | APIErrorResponse | null> {
  const apiRequest: APIRequest = {
    url: new URL('https://api.example.com/users'),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  };

  const result = await APICaller.call(
    apiRequest,
    decodeUser,      // Success decoder
    decodeAPIError   // Error decoder
  );

  if (result instanceof APISuccess) {
    return result.response; // Typed as User
  }

  // Handle typed error response
  if (result.response !== null) {
    // Error was successfully decoded - result.response is typed as APIErrorResponse
    console.log(`API Error [${result.response.code}]: ${result.response.message}`);
    return result.response;
  }

  // Decoding failed or network error - fall back to raw error info
  console.log('Request failed:', result.errorMessage);
  return null;
}
```

### Complete Error Handling Example

```typescript
type ValidationError = {
  field: string;
  message: string;
};

type ServerError = {
  error: string;
  validationErrors?: ValidationError[];
  requestId?: string;
};

function decodeServerError(raw: unknown): ServerError | null {
  if (typeof raw === 'object' && raw !== null && 'error' in raw) {
    return raw as ServerError;
  }
  return null;
}

async function submitForm(formData: FormData) {
  const result = await APICaller.call(
    { url: new URL('https://api.example.com/submit'), method: 'POST', body: formData },
    decodeSuccessResponse,
    decodeServerError
  );

  if (result instanceof APISuccess) {
    console.log('Success! Completed in', result.time, 'ms');
    return { success: true, data: result.response };
  }

  // APIFailure - determine the cause
  const failure = result;

  // Case 1: Server returned a structured error response
  if (failure.response !== null) {
    const serverError = failure.response;

    if (serverError.validationErrors) {
      // Handle validation errors
      return {
        success: false,
        validationErrors: serverError.validationErrors
      };
    }

    return {
      success: false,
      error: serverError.error,
      requestId: serverError.requestId
    };
  }

  // Case 2: Network or decoding error
  if (failure.errorDetails) {
    return {
      success: false,
      error: `${failure.errorDetails.class}: ${failure.errorDetails.message}`,
      isNetworkError: ['DOMException', 'TypeError'].includes(failure.errorDetails.class)
    };
  }

  // Case 3: HTTP error without structured response
  return {
    success: false,
    error: failure.errorMessage,
    httpStatus: failure.errorCode
  };
}
```

### APIFailure Properties Reference

| Property | Type | Description |
| -------- | ---- | ----------- |
| `errorMessage` | `string` | Human-readable error description |
| `errorCode` | `number` | HTTP status code, or `-1` for exceptions |
| `response` | `E \| null` | Decoded error response (if error decoder provided and succeeded) |
| `errorResponse` | `unknown` | Raw error response body |
| `errorDetails` | `ErrorDetails \| null` | Detailed error info for exceptions |
| `time` | `number` | Response time in milliseconds |

Checkout more examples in the [examples](https://github.com/sinha-sahil/typesafe-api-call/blob/release/examples/index.ts)

## Development

- Clone the repository
- Install dependencies using `pnpm install`
- Run `pnpm run build` to build the library.
- You can use examples/index.ts to test your changes.

## Contribution

- The library is open to all your suggestions & bugfixes and I would love to see your contributions.
- To contribute, kindly fork the repository & raise changes to the release branch.

## Useful Libraries

The following libraries work well with typesafe-api-call:

- [type-decoder](https://www.npmjs.com/package/type-decoder): A library to decode and validate data types
- [type-crafter](https://www.npmjs.com/package/type-crafter): Generate types & decoders from YAML specifications

When combined, you can define types in YAML and auto-generate TypeScript types and decoders to use with typesafe-api-call.

Checkout the [Example: YAML](https://github.com/sinha-sahil/typesafe-api-call/blob/release/examples/types.yaml) & [Example: Generated Types](https://github.com/sinha-sahil/typesafe-api-call/blob/release/examples/generated/index.ts)

## License

ISC

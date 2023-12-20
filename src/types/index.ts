import type { APIFailure } from './APIFailure';
import type { APISuccess } from './APISuccess';

export * from './APISuccess';
export * from './APIFailure';

/**
 * @name HttpMethod
 */
export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * @name APIRequest
 * @description Construct API Request which is consumable by the callAPI fn
 */

export interface APIRequest extends RequestInit {
  url: URL;
  method: HttpMethod;
  agent?: unknown /** To be typed as node-fetch/Agent when available in native fetch */;
}

/**
 * @name APIResponse
 * @description Denotes all possible responses of an API call
 */

export type APIResponse<SuccessResponseType, FailureResponseType> =
  | APISuccess<SuccessResponseType>
  | APIFailure<FailureResponseType>;

/**
 * @name ResponseDecoder
 */
export type ResponseDecoder<ExpectedResponse> = (rawResponse: unknown) => ExpectedResponse | null;

/**
 * @name FetchType
 * @description Type of native fetch function
 */
export type FetchType = (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

/**
 * @description types for hooks function which will be triggered on start & end of api calls
 * @description Takes two parameters id &
 */

/**
 * @name APICallStartHook
 */
export type APICallStartHook = { id: string; func: (apiRequest: APIRequest) => void };

/**
 * @name APICallEndHook
 */
export type APICallEndHook<SuccessResponseType, FailureResponseType> = {
  id: string;
  func: (
    apiRequest: APIRequest,
    apiResponse: APIResponse<SuccessResponseType, FailureResponseType>
  ) => void;
};

/**
 * @name APICallRetryHook
 * @description Hook function which will be triggered on retry of failed api calls
 * @property id: unique id of the hook
 * @property func: function to be executed on retry of failed api calls
 * @property retryAttempt: number of times the api call has been retried
 * @example
 * {
 * id: 'sampleRetryId',
 * func: (apiRequest: APIRequest, response: APIResponse<unknown, unknown>, retryCount) => {}
 * }
 */
export type APICallRetryHook<SuccessResponseType, FailureResponseType> = {
  id: string;
  func: (
    apiRequest: APIRequest,
    apiResponse: APIResponse<SuccessResponseType, FailureResponseType>,
    retryAttempt: number
  ) => void;
};

/**
 * @name ErrorClass
 * @description Classes of exceptions encountered during the fetch call or parsing network call response
 */
export type ErrorClass =
  | 'DOMException'
  | 'TypeError'
  | 'DecodeFailure'
  | 'InternalError'
  | 'Error'
  | 'UnhandledException';

/**
 * @name ErrorDetails
 * @description Typed error response for additional info on type of error encountered during fetch call or parsing network call response
 */
export type ErrorDetails = {
  class: ErrorClass;
  name: string;
  message: string | null;
  cause: unknown;
  stack: string | null;
};

/**
 * @name RetryConfig
 * @description Configuration for retrying failed API calls
 * @property maxRetries: number of times to retry the API call
 * @property retryInterval: interval between retries in milliseconds
 * @property retryOn: list of error classes on which to retry the API call
 * @example
 * {
 * maxRetries: 3,
 * retryInterval: 1000,
 * retryOn: ['DOMException', 'TypeError', 'DecodeFailure', 'InternalError', 'Error', 'UnhandledException']
 * }
 */
export type RetryConfig = {
  maxRetries: number;
  retryInterval: number;
  retryOn: ErrorClass[];
};

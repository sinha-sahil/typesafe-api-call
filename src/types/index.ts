import type { APIFailure } from './APIFailure';
import type { APISuccess } from './APISuccess';

export * from './APISuccess';
export * from './APIFailure';

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

export type ResponseDecoder<ExpectedResponse> = (rawResponse: unknown) => ExpectedResponse | null;

/**
 * @description Type of native fetch function
 */
export type FetchType = (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

/**
 * @description types for hooks function which will be triggered on start & end of api calls
 */

export type APICallStartHook = (apiRequest: APIRequest) => void;

export type APICallEndHook<SuccessResponseType, FailureResponseType> = (
  apiRequest: APIRequest,
  apiResponse: APIResponse<SuccessResponseType, FailureResponseType>
) => void;

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
 * @description Takes two parameters id &
 */

export type APICallStartHook = { id: string; func: (apiRequest: APIRequest) => void };

export type APICallEndHook<SuccessResponseType, FailureResponseType> = {
  id: string;
  func: (
    apiRequest: APIRequest,
    apiResponse: APIResponse<SuccessResponseType, FailureResponseType>
  ) => void;
};

/**
 * @description Recursive type for all possible value a key in JSON can have
 */

export type JSONValue = string | number | boolean | null | JSONObject | JSONValue[];

export type JSONObject = {
  [key: string]: JSONValue;
};

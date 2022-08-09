import type { APIFailure } from './APIFailure';
import type { APISuccess } from './APISuccess';

/**
 * @name APIResponse
 * @description Denotes all possible responses of an API call
 */

export type APIResponse<ExpectedResponseType> = APISuccess<ExpectedResponseType> | APIFailure;

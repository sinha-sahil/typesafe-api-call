import { generateRawResponse, getErrorDetails } from './utils';
import type {
  APICallStartHook,
  APICallEndHook,
  APIRequest,
  APIResponse,
  FetchType,
  ResponseDecoder,
  ErrorDetails
} from './types';
import { APISuccess, APIFailure } from './types';

export class APICaller {
  static startHooks: APICallStartHook[] = [];
  static endHooks: Array<APICallEndHook<unknown, unknown>> = [];

  /**
   * @name APICaller.call
   * @description A global function for making API Calls, Uses fetch and constructs request from apiRequest param passed
   * @param apiRequest An instance/object which implements APIRequest interface used to call API
   * @param responseDecoder An function which helps decoding successful raw response to expected success type
   * @param errorResponseDecoder A function which helps decoding failure raw response to expected failure type
   * @param apiCaller function to override the native fetch method
   * @returns An resolved Promise with Two Instances - APISuccess or APIFailure
   */

  static async call<SuccessResponse, ErrorResponse = null>(
    apiRequest: APIRequest,
    responseDecoder: ResponseDecoder<SuccessResponse>,
    errorResponseDecoder: ResponseDecoder<ErrorResponse> | null = null,
    apiCaller: FetchType = fetch
  ): Promise<APIResponse<SuccessResponse, ErrorResponse>> {
    let result: APIResponse<SuccessResponse, ErrorResponse>;
    try {
      this.startHooks.forEach((hook) => {
        hook.func(apiRequest);
      });
      const startTime = Date.now();
      const apiResponse: Response = await apiCaller(apiRequest.url.href, apiRequest);
      const timeConsumed = Date.now() - startTime;
      const rawResponse: unknown = await generateRawResponse(apiResponse);
      const decodeResponse = responseDecoder(rawResponse);
      if (decodeResponse !== null) {
        const apiSuccessResponse = new APISuccess(
          apiResponse.status,
          apiResponse.statusText,
          decodeResponse,
          timeConsumed
        );
        result = apiSuccessResponse;
      } else {
        const decodedErrorResponse =
          errorResponseDecoder !== null ? errorResponseDecoder(rawResponse) : null;
        const errorDetails: ErrorDetails | null =
          decodedErrorResponse !== null
            ? null
            : {
                class: 'DecodeFailure',
                name: 'DecodeFailure',
                cause: null,
                message: '',
                stack: null
              };
        const apiFailureResponse = new APIFailure<ErrorResponse>(
          'Failed to decode API result to success response',
          apiResponse.status,
          decodedErrorResponse,
          rawResponse,
          timeConsumed,
          errorDetails
        );
        result = apiFailureResponse;
      }
    } catch (error: unknown) {
      result = new APIFailure<ErrorResponse>(
        'Exception in APICaller.call',
        -1,
        null,
        error,
        0,
        getErrorDetails(error)
      );
    }
    this.endHooks.forEach((hook) => {
      hook.func(apiRequest, result);
    });
    return result;
  }

  static registerStartHook(hook: APICallStartHook): void {
    if (typeof this.startHooks.find((presentHook) => presentHook.id === hook.id) !== 'undefined') {
      this.startHooks.push(hook);
    }
  }

  static registerEndHook(hook: APICallEndHook<unknown, unknown>): void {
    if (typeof this.endHooks.find((presentHook) => presentHook.id === hook.id) !== 'undefined') {
      this.endHooks.push(hook);
    }
  }
}

import { generateRawResponse, getErrorDetails, sleep } from './utils';
import type {
  APICallStartHook,
  APICallEndHook,
  APIRequest,
  APIResponse,
  FetchType,
  ResponseDecoder,
  ErrorDetails,
  RetryConfig,
  APICallRetryHook
} from './types';
import { APISuccess, APIFailure } from './types';

export class APICaller {
  static startHooks: APICallStartHook[] = [];
  static endHooks: Array<APICallEndHook<unknown, unknown>> = [];
  static retryHooks: Array<APICallRetryHook<unknown, unknown>> = [];

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

  /**
   * @description A global function for making API Calls, Uses fetch and constructs request from apiRequest param passed with support retrying failed calls
   * @param apiRequest An instance/object which implements APIRequest interface used to call API
   * @param responseDecoder An function which helps decoding successful raw response to expected success type
   * @param retryConfig Configuration for retrying failed API calls
   * @param errorResponseDecoder A function which helps decoding failure raw response to expected failure type
   * @param apiCaller function to override the native fetch method
   * @returns An resolved Promise with Two Instances - APISuccess or APIFailure
   */
  static async callWithRetries<SuccessResponse, ErrorResponse = null>(
    apiRequest: APIRequest,
    responseDecoder: ResponseDecoder<SuccessResponse>,
    retryConfig: RetryConfig,
    errorResponseDecoder: ResponseDecoder<ErrorResponse> | null = null,
    apiCaller: FetchType = fetch
  ): Promise<APIResponse<SuccessResponse, ErrorResponse>> {
    let response = await this.call(apiRequest, responseDecoder, errorResponseDecoder, apiCaller);
    // Triggering retries if first call failed
    if (response instanceof APIFailure) {
      for (let i = 0; i < retryConfig.maxRetries; i++) {
        this.retryHooks.forEach((hook) => {
          hook.func(apiRequest, response, i + 1);
        });
        await sleep(retryConfig.retryInterval);
        response = await this.call(apiRequest, responseDecoder, errorResponseDecoder, apiCaller);
        // Stopping if response is success or error is not whitelisting in retrying.
        if (
          response instanceof APISuccess ||
          (response.errorDetails !== null &&
            !retryConfig.retryOn.includes(response.errorDetails.class))
        ) {
          break;
        }
      }
    }
    return response;
  }

  static registerStartHook(hook: APICallStartHook): void {
    if (typeof this.startHooks.find((presentHook) => presentHook.id === hook.id) === 'undefined') {
      this.startHooks.push(hook);
    }
  }

  static registerEndHook(hook: APICallEndHook<unknown, unknown>): void {
    if (typeof this.endHooks.find((presentHook) => presentHook.id === hook.id) === 'undefined') {
      this.endHooks.push(hook);
    }
  }

  static registerRetryHook(hook: APICallRetryHook<unknown, unknown>): void {
    if (typeof this.retryHooks.find((presentHook) => presentHook.id === hook.id) === 'undefined') {
      this.retryHooks.push(hook);
    }
  }
}

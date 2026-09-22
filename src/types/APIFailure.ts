import { ErrorDetails } from '.';

/**
 * @name APIFailure
 * @description Construct an API Error Instance.
 * @constructor Takes ErrorMessage String and Error Code Number
 */
export class APIFailure<FailureResponseType> {
  readonly errorMessage: string;
  readonly errorCode: number;
  readonly response: FailureResponseType | null;
  readonly errorResponse: unknown;
  readonly errorDetails: ErrorDetails | null;
  readonly time: number;

  readonly headers: Headers | null;
  readonly url: string | null;
  readonly redirected: boolean | null;
  readonly type: Response['type'] | null;

  constructor({
    errorMessage,
    errorCode,
    response,
    errorResponse,
    time,
    errorDetails,
    fetchResponse
  }: {
    errorMessage: string;
    errorCode: number;
    response: FailureResponseType | null;
    errorResponse: unknown;
    time: number;
    errorDetails: ErrorDetails | null;
    fetchResponse: Response | null;
  }) {
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.response = response;
    this.errorResponse = errorResponse;
    this.errorDetails = errorDetails;
    this.time = time;

    this.headers = fetchResponse?.headers ?? null;
    this.url = fetchResponse?.url ?? null;
    this.redirected = fetchResponse ? (fetchResponse.redirected ?? false) : null;
    this.type = fetchResponse ? (fetchResponse.type ?? 'default') : null;
  }
}

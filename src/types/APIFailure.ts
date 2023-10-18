import { ErrorDetails } from ".";

/**
 * @name APIFailure
 * @description Construct an API Error Instance.
 * @constructor Takes ErrorMessage String and Error Code Number
 */
export class APIFailure<FailureResponseType> {
  readonly errorMessage: string;
  readonly errorCode: number;
  readonly response: FailureResponseType;
  readonly errorResponse: unknown;
  readonly errorDetails: ErrorDetails;
  readonly time: number;

  constructor(errorMessage: string, errorCode: number, response: FailureResponseType, errorResponse: unknown, time: number, errorDetails: ErrorDetails) {
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.response = response;
    this.errorResponse = errorResponse;
    this.errorDetails = errorDetails;
    this.time = time;
  }
}

import { JSONObject } from "type-decoder/types";

/**
 * @name APIFailure
 * @description Construct an API Error Instance.
 * @constructor Takes ErrorMessage String and Error Code Number
 */
export class APIFailure<FailureResponseType> {
  readonly errorMessage: string;
  readonly errorCode: number;
  readonly errorResponse: FailureResponseType | unknown;
  readonly errorDetails: JSONObject | null;
  readonly time: number;

  constructor(errorMessage: string, errorCode: number, errorResponse: unknown, time: number, errorDetails: JSONObject | null = null) {
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.errorResponse = errorResponse;
    this.errorDetails = errorDetails;
    this.time = time;
  }
}

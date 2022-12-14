/**
 * @description A set utility function which helps the user decode values to primitive/ generic types
 */

// Unique string delimiter to denote a key was not found.
// Added to avoid fallback as null which might cause adding adding additional null checks before using
export const errorDelimiter = '<!!error!!>';

export function decodeString(value: any): string | null {
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

/**
 * @description A function which attempts to safely cast any value to a valid string
 * @param value Any value
 * @returns Attempts to convert the passed value to a valid string, returns errorDelimiter in case cast fails
 */
export function _decodeString(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  return errorDelimiter;
}

/**
 * @description A function which attempts to safely cast any value to a valid number
 * @param value Any value
 * @returns Attempts to convert the passed value to a valid number, returns null in case cast fails
 */
export function decodeNumber(value: any): number | null {
  if (typeof value === 'number') {
    return value;
  }
  return null;
}

/**
 * @description A function which attempts to safely cast any value to a valid boolean
 * @param value Any value
 * @returns Attempts to convert the passed value to a valid boolean, returns null in case cast fails
 */
export function decodeBoolean(value: any): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  return null;
}

/**
 * @description A function which attempts to decode any value to a generic arrays
 * @param value Any value
 * @param decoder A function which decodes the any data to the generic type passed, if decode fails returns null, This will be used to decode all elements of the any array passed
 * @returns Array of decoded elements if passed value was an array and elements were of generic type, returns null in case value passed was not array at all
 */
export function decodeArray<ArrayElementType>(
  value: any,
  decoder: (rawInput: any) => ArrayElementType | null
): Array<ArrayElementType> | null {
  if (Array.isArray(value)) {
    const result: Array<ArrayElementType> = [];
    value.forEach((currentElement: any) => {
      const decodedCurrentElement = decoder(currentElement);
      if (decodedCurrentElement) {
        result.push(decodedCurrentElement);
      }
    });
    return result;
  }
  return null;
}

export function castArray<FromType, ToType>(
  fromArray: Array<FromType>,
  converter: (from: FromType) => ToType
): Array<ToType> {
  return fromArray.map((element) => converter(element));
}

export function decodeDate(rawInput: any): Date | null {
  if (typeof rawInput === 'string' || typeof rawInput === 'object') {
    const constructedDate = new Date('' + rawInput);
    if (!isNaN(constructedDate.getTime())) {
      return constructedDate;
    }
  }
  return null;
}

/**
 * @description Check if a JSON has no null and no error delimiter string
 * @param value JSON Object
 * @returns A boolean which denotes if all values of a JSON Object are neither null nor errorDelimiter string
 */

export function noErrorOrNullValues(
  value: { [key: string]: any },
  nullableKeys: Array<string> = []
): boolean {
  let noErrorsPresent = true;
  let noNullPresent = true;
  Object.keys(value).forEach((key) => {
    if (value[key] === null && nullableKeys.includes(key)) {
      return;
    } else if (typeof value[key] === 'string') {
      noErrorsPresent &&= value[key] !== errorDelimiter;
    } else {
      noNullPresent &&= value[key] !== null;
    }
  });
  return noErrorsPresent && noNullPresent;
}

export function isJSON(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

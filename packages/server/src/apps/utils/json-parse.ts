import { jsonrepair } from 'jsonrepair';

export function jsonParse(
  jsonString: any,
  args?: {
    returnWithoutParsingIfError?: boolean;
  },
): any {
  try {
    if (typeof jsonString === 'object') {
      return jsonString;
    } else {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        if (typeof jsonString === 'string') {
          try {
            const repairedJson = jsonrepair(jsonString);
            return JSON.parse(repairedJson);
          } catch (error) {
            throw new Error('Invalid JSON: ' + error.message);
          }
        }
        throw new Error('Invalid JSON: ' + error.message);
      }
    }
  } catch (err) {
    if (args?.returnWithoutParsingIfError) {
      return jsonString;
    }
    throw err;
  }
}

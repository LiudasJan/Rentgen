import { Method } from 'axios';
import {
  convertFormEntriesToUrlEncoded,
  detectFieldType,
  encodeMessage,
  extractFieldsFromJson,
  extractQueryParams,
  getHeaderValue,
  parseFormData,
} from '../utils';

export async function sendHttpRequest(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
  messageType: string,
  protoFile: File | null,
): Promise<
  { response: any; fieldMappings: Record<string, string>; queryMappings: Record<string, string> } | undefined
> {
  try {
    const fieldMappings: Record<string, string> = {};
    const queryMappings: Record<string, string> = {};
    const contentType = getHeaderValue(headers, 'content-type');
    const isForm = /application\/x-www-form-urlencoded/i.test(contentType);

    let data: string | Uint8Array | undefined = body;
    if (protoFile && messageType) data = encodeMessage(messageType, JSON.parse(body));
    else if (isForm) data = convertFormEntriesToUrlEncoded(parseFormData(String(body)));

    // Ensure proper Content-Type header for form data
    if (isForm && !getHeaderValue(headers, 'content-type'))
      headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const response = await window.electronAPI.sendHttp({
      url,
      method,
      headers,
      body: data,
    });

    if (!response.status.startsWith('2')) return { response, fieldMappings, queryMappings };

    // Generate test mappings based on request body (not response)
    if (isForm) {
      const formEntries = parseFormData(String(body));

      for (const [key, value] of formEntries) fieldMappings[`form.${key}`] = detectFieldType(value);
    } else {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = null;
      }

      if (parsedBody) {
        // Extract all fields from request body (including nested)
        const extractedFields = extractFieldsFromJson(parsedBody);

        for (const [fieldPath, fieldType] of Object.entries(extractedFields)) {
          if (fieldType === 'DO_NOT_TEST') fieldMappings[fieldPath] = 'do-not-test';
          else {
            const pathSegments = fieldPath.replace(/\[(\d+)\]/g, '.$1').split('.');
            let fieldValue = parsedBody;
            for (const segment of pathSegments) {
              if (fieldValue == null) break;
              fieldValue = fieldValue[segment];
            }

            fieldMappings[fieldPath] = detectFieldType(fieldValue);
          }
        }
      }
    }

    const queryParams = extractQueryParams(url);
    for (const [key, value] of Object.entries(queryParams)) queryMappings[key] = detectFieldType(value);

    return { response, fieldMappings, queryMappings };
  } catch (error) {
    return {
      response: {
        status: 'Network Error',
        body: String(error),
        headers: {},
      },
      fieldMappings: {},
      queryMappings: {},
    };
  }
}

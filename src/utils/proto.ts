import protobuf, { parse } from 'protobufjs';
import { HttpResponse } from '../types';

let root: protobuf.Root | null = null;

export function getProtoRoot(): protobuf.Root | null {
  return root;
}

export function isSchemaLoaded(): boolean {
  return root !== null;
}

export function clearSchema(): void {
  root = null;
}

export async function loadProtoSchema(file: File): Promise<protobuf.Root> {
  if (!file) throw new Error('No file provided for protobuf schema');

  try {
    const text = await file.text();
    if (!text.trim()) throw new Error('Protobuf schema file is empty');

    root = parse(text).root;
    return root;
  } catch (error) {
    throw new Error(`Failed to load protobuf schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function encodeMessage(path: string, data: unknown): Uint8Array {
  if (!root) throw new Error('Protobuf schema not loaded. Call loadProtoSchema() first.');
  if (!path || typeof path !== 'string') throw new Error('Invalid path provided');

  try {
    const type = root.lookupType(path);
    const validationError = type.verify(data);

    if (validationError) throw new Error(`Message validation failed: ${validationError}`);

    return type.encode(type.fromObject(data)).finish();
  } catch (error) {
    throw new Error(`Failed to encode message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function decodeMessage(path: string, buffer: Uint8Array): Record<string, unknown> {
  if (!root) throw new Error('Protobuf schema not loaded. Call loadProtoSchema() first.');
  if (!path || typeof path !== 'string') throw new Error('Invalid path provided');
  if (!buffer || !(buffer instanceof Uint8Array)) throw new Error('Invalid buffer provided for decoding');

  try {
    const type = root.lookupType(path);
    const message = type.decode(buffer);

    return type.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
      defaults: true,
      arrays: true,
      objects: true,
    }) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Failed to decode message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function decodeProtobufResponse(messageType: string, response: HttpResponse): string | null {
  try {
    return JSON.stringify(decodeMessage(messageType, new Uint8Array(response.body as any)), null, 2);
  } catch {
    return null;
  }
}

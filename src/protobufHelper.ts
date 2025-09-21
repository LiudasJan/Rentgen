import protobuf from "protobufjs";

let root: protobuf.Root | null = null;

export async function loadProto(file: File) {
  const text = await file.text();
  root = protobuf.parse(text).root;
  return root;
}

export function encodeMessage(typeName: string, json: any): Uint8Array {
  if (!root) throw new Error("Proto not loaded");
  const Type = root.lookupType(typeName);
  const err = Type.verify(json);
  if (err) throw new Error(err);
  return Type.encode(Type.fromObject(json)).finish();
}

export function decodeMessage(typeName: string, buffer: Uint8Array): any {
  if (!root) throw new Error("Proto not loaded");
  const Type = root.lookupType(typeName);
  return Type.toObject(Type.decode(buffer), {
    longs: String,
    enums: String,
    bytes: String
  });
}

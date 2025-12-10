export interface TextSegment {
  text: string;
  isVariable: boolean;
}

/**
 * Parses text and identifies {{variable}} patterns.
 * Returns an array of segments, each marked as variable or not.
 */
export function parseVariables(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  const regex = /\{\{([^}]+)}}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isVariable: false,
      });
    }

    segments.push({
      text: match[0],
      isVariable: true,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isVariable: false,
    });
  }

  return segments;
}

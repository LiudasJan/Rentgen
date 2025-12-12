import { useMemo } from 'react';
import { parseVariables } from '../utils/highlightVariables';

interface Props {
  highlightColor: string;
  variables?: string[];
  text: string;
}

export default function VariableHighlighter({ highlightColor, variables = [], text }: Props) {
  const segments = useMemo(() => parseVariables(text), [text]);
  const variableKeys = useMemo(() => new Set(variables.map((variable) => variable.trim())), [variables]);

  const variableExists = (segmentText: string): boolean => {
    const varName = segmentText.slice(2, -2).trim();
    return variableKeys.has(varName);
  };

  return (
    <span>
      {segments.map((segment, index) =>
        segment.isVariable && variableExists(segment.text) ? (
          <span
            key={index}
            style={{
              color: highlightColor,
              backgroundColor: `${highlightColor}20`,
              borderRadius: '2px',
            }}
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

import { useMemo } from 'react';
import { parseVariables } from '../../utils/highlightVariables';
import { EnvironmentVariable } from '../../types';

interface VariableHighlighterProps {
  text: string;
  highlightColor: string;
  variables?: EnvironmentVariable[];
  className?: string;
}

export default function VariableHighlighter({
  text,
  highlightColor,
  variables = [],
  className,
}: VariableHighlighterProps) {
  const segments = useMemo(() => parseVariables(text), [text]);

  const variableKeys = useMemo(() => new Set(variables.map((v) => v.key.trim())), [variables]);

  const variableExists = (segmentText: string): boolean => {
    const varName = segmentText.slice(2, -2).trim();
    return variableKeys.has(varName);
  };

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.isVariable && variableExists(segment.text) ? (
          <span
            key={index}
            style={{
              color: highlightColor,
              backgroundColor: `${highlightColor}20`,
              borderRadius: '2px',
              padding: '0 1px',
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

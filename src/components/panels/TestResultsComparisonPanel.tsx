import { diffJson } from 'diff';
import { useMemo } from 'react';
import { TestResults } from '../../types';
import Panel, { Props as PanelProps } from './Panel';

interface Props extends PanelProps {
  items: TestResults[];
}

export default function TestResultsComparisonPanel({ title, items, ...otherProps }: Props) {
  const { diff, statistics } = useMemo(() => {
    if (items.length < 2)
      return {
        diff: [],
        statistics: { added: 0, removed: 0, unchanged: 0, percent: 0 },
      };

    let added = 0;
    let removed = 0;
    let unchanged = 0;

    const diff = diffJson(items[0], items[1]);
    diff.forEach((part) => {
      const len = part.value.length;
      if (part.added) added += len;
      else if (part.removed) removed += len;
      else unchanged += len;
    });

    const originalLength = removed + unchanged;
    const percent = originalLength === 0 ? 100 : Math.round(((added + removed) / originalLength) * 100);

    return {
      diff,
      statistics: { added, removed, unchanged, percent },
    };
  }, [items]);

  return (
    <Panel className="flex flex-col max-h-[calc(100vh-2.5rem)] box-border" title={title} {...otherProps}>
      {diff.length < 1 ? (
        <p className="p-4 m-0">No test results to compare</p>
      ) : (
        <>
          <div className="shrink-0 flex p-4 gap-2 text-sm bg-body dark:bg-dark-body border-y border-border dark:border-dark-body">
            <span>
              Changed: <b>{statistics.percent}%</b>
            </span>
            <span className="text-method-post dark:text-dark-method-post">+{statistics.added}</span>
            <span className="text-method-delete dark:text-dark-method-delete">-{statistics.removed}</span>
            <span>={statistics.unchanged}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <pre className="m-0 whitespace-pre-wrap">
              {diff.map((part, index) => {
                const value = part.value;

                if (part.added)
                  return (
                    <ins
                      key={index}
                      className="text-method-post dark:text-dark-method-post bg-method-post/10 no-underline"
                    >
                      {value}
                    </ins>
                  );

                if (part.removed)
                  return (
                    <del
                      key={index}
                      className="text-method-delete dark:text-dark-method-delete bg-method-delete/10 no-underline"
                    >
                      {value}
                    </del>
                  );

                return <span key={index}>{value}</span>;
              })}
            </pre>
          </div>
        </>
      )}
    </Panel>
  );
}

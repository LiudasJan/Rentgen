import { memo, useMemo } from 'react';
import DataTable, { ExpanderComponentProps, TableProps } from 'react-data-table-component';
import { HttpResponse } from '../../types';
import { JsonDiffViewer } from '../viewers/JsonDiffViewer';
import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';

export interface PotentialBug {
  name: string;
  issue: string;
  originalResponse: HttpResponse | null;
  modifiedResponse: HttpResponse | null;
}

export default function PotentialBugsTable({ data, ...otherProps }: Omit<TableProps<PotentialBug>, 'columns'>) {
  const theme = useAppSelector(selectTheme);
  const definedData = useMemo(() => data?.filter(Boolean) ?? [], [data]);
  const isDark = theme === 'dark';

  return (
    <DataTable
      columns={[
        {
          name: 'Name',
          selector: (row) => row.name,
        },
        {
          name: 'Description',
          selector: (row) => row.issue,
          style: {
            'div:first-child': {
              padding: '0.25rem 0',
              whiteSpace: 'pre !important',
            },
          },
        },
      ]}
      customStyles={{
        expanderCell: {
          style: { minWidth: '28px', width: '28px', flex: '0 0 28px' },
        },
        expanderButton: {
          style: {
            '&:hover': { backgroundColor: 'transparent !important' },
            '&:focus': { backgroundColor: 'transparent !important' },
            '&:disabled': { display: 'none' },
            ...(isDark && { color: 'white' }),
          },
        },
        headRow: {
          style: {
            color: isDark ? 'white' : 'black',
            backgroundColor: isDark ? '#23272f' : '#fafafa',
            ...(isDark && {
              borderBottomColor: '#343a46',
            }),
          },
        },
        rows: {
          style: {
            color: isDark ? 'white' : 'black',
            backgroundColor: 'transparent',
            ...(isDark && {
              '&:not(:last-of-type)': {
                borderBottomColor: '#343a46',
              },
            }),
          },
        },
        table: {
          style: {
            backgroundColor: 'transparent',
          },
        },
      }}
      expandableRows
      expandableRowsComponent={ExpandedTestComponent}
      expandOnRowClicked
      data={definedData}
      fixedHeader={true}
      {...otherProps}
    />
  );
}

export const ExpandedTestComponent = memo(({ data }: ExpanderComponentProps<PotentialBug>) => (
  <JsonDiffViewer className="h-90 py-4" data={[data.originalResponse, data.modifiedResponse]} />
));

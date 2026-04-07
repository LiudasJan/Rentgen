import cn from 'classnames';
import { memo, useMemo } from 'react';
import DataTable, { ExpanderComponentProps, TableColumn, TableProps } from 'react-data-table-component';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TestResult, TestStatus } from '../../types';
import {
  decodeProtobufResponse,
  extractBodyFromResponse,
  generateCurl,
  isUrlEncodedContentType,
  truncateValue,
} from '../../utils';
import { CopyButton } from '../buttons/CopyButton';
import { HttpPanel } from '../panels/HttpPanel';

export default function TestsTable({ columns, data, className, ...otherProps }: TableProps<TestResult>) {
  const definedData = useMemo(() => data?.filter(Boolean) ?? [], [data]);

  return (
    <DataTable
      className={cn('border-t border-border dark:border-t-0 rounded-t-none!', className)}
      columns={columns}
      conditionalRowStyles={[
        {
          when: (row) => row.status === TestStatus.Pass,
          style: { backgroundColor: '#d4edda' },
        },
        {
          when: (row) => row.status === TestStatus.Fail || row.status === TestStatus.FailNoResponse,
          style: { backgroundColor: '#f8d7da' },
        },
        {
          when: (row) => row.status === TestStatus.Manual,
          style: { backgroundColor: '#e2e3e5' },
        },
        {
          when: (row) => row.status === TestStatus.Warning,
          style: { backgroundColor: '#fff3cd' },
        },
        {
          when: (row) => row.status === TestStatus.Info,
          style: { backgroundColor: '#e6f0ff' },
        },
        {
          when: (row) => row.status === TestStatus.Bug,
          style: { backgroundColor: '#f3e8ff' },
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
          },
        },
      }}
      data={definedData}
      {...otherProps}
    />
  );
}

export const ExpandedTestComponent = memo(
  ({
    data,
    headers,
    messageType,
    protoFile,
  }: ExpanderComponentProps<TestResult> & {
    headers: Record<string, string>;
    messageType: string;
    protoFile: File | null;
  }) => {
    const { t } = useTranslation();
    const { request, response } = data;
    const decoded =
      headers && isUrlEncodedContentType(headers) && protoFile && messageType
        ? decodeProtobufResponse(messageType, response)
        : null;
    const modifiedResponse = response ? { ...response } : null;

    if (modifiedResponse && modifiedResponse.body)
      modifiedResponse.body = extractBodyFromResponse(modifiedResponse) as any;

    return (
      <div className="p-4 bg-body dark:bg-dark-body">
        {request && (
          <CopyButton className="mb-4" textToCopy={generateCurl(request)}>
            {t('curl.copyCurl')}
          </CopyButton>
        )}
        <div className="grid grid-cols-2 gap-4 items-stretch">
          <HttpPanel title={t('tables.request')} source={request} />
          <HttpPanel title={t('response.title')} source={modifiedResponse}>
            {decoded && <HttpPanel title={t('protobuf.decodedProtobuf')} source={decoded} />}
          </HttpPanel>
        </div>
      </div>
    );
  },
);

type TestsTableColumn = 'Parameter' | 'Value' | 'Check' | 'Method' | 'Expected' | 'Actual' | 'Result';

const columnTranslationKeys: Record<TestsTableColumn, string> = {
  Parameter: 'tables.parameter',
  Value: 'tables.value',
  Check: 'tables.check',
  Method: 'tables.method',
  Expected: 'tables.expected',
  Actual: 'tables.actual',
  Result: 'tables.result',
};

export function getTestsTableColumns(
  visibleColumns: TestsTableColumn[] = [],
  t?: TFunction,
): TableColumn<TestResult>[] {
  const label = (key: TestsTableColumn) => (t ? t(columnTranslationKeys[key]) : key);

  const columns: (TableColumn<TestResult> & { key: TestsTableColumn })[] = [
    {
      key: 'Parameter',
      name: label('Parameter'),
      selector: (row) => row.name,
      omit: true,
    },
    {
      key: 'Value',
      name: label('Value'),
      selector: (row) => truncateValue(row.value),
      omit: true,
      style: {
        'div:first-child': {
          whiteSpace: 'pre !important',
        },
      },
    },
    {
      key: 'Check',
      name: label('Check'),
      selector: (row) => row.name,
      omit: true,
    },
    {
      key: 'Method',
      name: label('Method'),
      selector: (row) => row.name,
      omit: true,
    },
    {
      key: 'Expected',
      name: label('Expected'),
      selector: (row) => row.expected,
      omit: true,
      style: {
        'div:first-child': {
          padding: '0.25rem 0',
          whiteSpace: 'normal !important',
        },
      },
    },
    {
      key: 'Actual',
      name: label('Actual'),
      selector: (row) => row.actual,
      omit: true,
      style: {
        'div:first-child': {
          padding: '0.5rem 0',
          whiteSpace: 'normal !important',
        },
      },
    },
    {
      key: 'Result',
      name: label('Result'),
      selector: (row) => row.status,
      width: '150px',
      omit: true,
    },
  ];

  return columns.map((column) => ({ ...column, omit: !visibleColumns.includes(column.key) }));
}

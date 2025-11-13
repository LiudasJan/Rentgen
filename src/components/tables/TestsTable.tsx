import cn from 'classnames';
import DataTable, { ExpanderComponentProps, TableColumn, TableProps } from 'react-data-table-component';
import { Test, TestStatus } from '../../types';
import { generateCurl, truncateValue, tryParseJsonObject } from '../../utils';
import { CopyButton } from '../buttons/CopyButton';

export default function TestsTable({ columns, data, className, ...otherProps }: TableProps<Test>) {
  return (
    <DataTable
      className={cn('border-t border-border rounded-t-none!', className)}
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
          style: { backgroundColor: '#ffe0e0' },
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
          },
        },
      }}
      data={data}
      {...otherProps}
    />
  );
}

export function ExpandedTestComponent({ data }: ExpanderComponentProps<Test>) {
  const { decoded, request, response } = data;

  let modifiedResponse = response;
  if (modifiedResponse && modifiedResponse.body && typeof modifiedResponse.body === 'string')
    modifiedResponse = { ...modifiedResponse, body: tryParseJsonObject(modifiedResponse.body) };

  return (
    <div className="p-4 bg-table-data">
      {request && (
        <CopyButton
          className="mb-4"
          textToCopy={generateCurl(request.body, request.headers, request.method, request.url)}
        >
          Copy cURL
        </CopyButton>
      )}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        <div className="flex flex-col gap-2.5">
          <h4 className="m-0">Request</h4>
          <pre className="max-h-80 flex-auto m-0 p-2.5 bg-white border border-border rounded whitespace-pre-wrap break-all overflow-y-auto">
            {JSON.stringify(request, null, 2)}
          </pre>
        </div>
        <div className="flex flex-col gap-2.5">
          <h4 className="m-0">Response</h4>
          <pre className="max-h-80 flex-auto m-0 p-2.5 bg-white border border-border rounded whitespace-pre-wrap break-all overflow-y-auto">
            {typeof modifiedResponse === 'string' ? modifiedResponse : JSON.stringify(modifiedResponse, null, 2)}
          </pre>
          {decoded && (
            <>
              <h5 className="m-0">Decoded Protobuf</h5>
              <pre className="flex-auto m-0 p-2.5 bg-white border border-border rounded whitespace-pre-wrap break-all">
                {decoded}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function getTestsTableColumns(visibleColumns: string[] = []): TableColumn<Test>[] {
  const columns: TableColumn<Test>[] = [
    {
      name: 'Field',
      selector: (row) => row.field,
      omit: true,
    },
    {
      name: 'Value',
      selector: (row) => truncateValue(row.value),
      omit: true,
    },
    {
      name: 'Check',
      selector: (row) => row.name,
      omit: true,
    },
    {
      name: 'Method',
      selector: (row) => row.method,
      omit: true,
    },
    {
      name: 'Expected',
      selector: (row) => row.expected,
      omit: true,
    },
    {
      name: 'Actual',
      selector: (row) => row.actual,
      omit: true,
    },
    {
      name: 'Result',
      selector: (row) => row.status,
      width: '150px',
      omit: true,
    },
  ];

  return columns.map((column) => ({ ...column, omit: !visibleColumns.includes(column.name.toString()) }));
}

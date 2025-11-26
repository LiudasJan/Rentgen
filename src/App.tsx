import { Method } from 'axios';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import { CopyButton } from './components/buttons/CopyButton';
import { LargePayloadTestControls } from './components/controls/LargePayloadTestControls';
import { LoadTestControls } from './components/controls/LoadTestControls';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import Textarea from './components/inputs/Textarea';
import TextareaAutosize from './components/inputs/TextareaAutosize';
import { JsonViewer } from './components/JsonViewer';
import Loader from './components/loaders/Loader';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import Modal from './components/modals/Modal';
import ParametersPanel from './components/panels/ParametersPanel';
import ResponsePanel from './components/panels/ResponsePanel';
import TestsTable, { ExpandedTestComponent, getTestsTableColumns } from './components/tables/TestsTable';
import { RESPONSE_STATUS } from './constants/responseStatus';
import useTests from './hooks/useTests';
import { LARGE_PAYLOAD_TEST_NAME, LOAD_TEST_NAME } from './tests';
import { FieldType, HttpResponse, TestOptions } from './types';
import {
  createHttpRequest,
  detectFieldType,
  extractBodyFieldMappings,
  extractBodyFromResponse,
  extractCurl,
  extractQueryParameters,
  extractStatusCode,
  formatBody,
  loadProtoSchema,
  parseBody,
  parseHeaders,
} from './utils';

type Mode = 'HTTP' | 'WSS';

const SENDING = 'Sending...';
const NETWORK_ERROR = 'Network Error';

const modeOptions: SelectOption<Mode>[] = [
  { value: 'HTTP', label: 'HTTP' },
  { value: 'WSS', label: 'WSS' },
];

const methodOptions: SelectOption<Method>[] = [
  { value: 'GET', label: 'GET', className: 'text-method-get!' },
  { value: 'POST', label: 'POST', className: 'text-method-post!' },
  { value: 'PUT', label: 'PUT', className: 'text-method-put!' },
  { value: 'PATCH', label: 'PATCH', className: 'text-method-patch!' },
  { value: 'DELETE', label: 'DELETE', className: 'text-method-delete!' },
  { value: 'HEAD', label: 'HEAD', className: 'text-method-head!' },
  { value: 'OPTIONS', label: 'OPTIONS', className: 'text-method-options!' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('HTTP');
  const [method, setMethod] = useState<Method>('GET');
  const [openCurlModal, setOpenCurlModal] = useState<boolean>(false);
  const [openReloadModal, setOpenReloadModal] = useState<boolean>(false);
  const [curl, setCurl] = useState<string>('');
  const [curlError, setCurlError] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [body, setBody] = useState<string>('{}');
  const [headers, setHeaders] = useState<string>('');
  const [wssConnected, setWssConnected] = useState<boolean>(false);
  const [protoFile, setProtoFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<string>('');
  const [httpResponse, setHttpResponse] = useState<HttpResponse | null>(null);
  const [messages, setMessages] = useState<
    {
      direction: 'sent' | 'received' | 'system';
      data: string;
      decoded?: string | null;
    }[]
  >([]);
  const [bodyMappings, setBodyMappings] = useState<Record<string, FieldType>>({});
  const [queryMappings, setQueryMappings] = useState<Record<string, FieldType>>({});
  const [testOptions, setTestOptions] = useState<TestOptions | null>(null);
  const {
    crudTests,
    currentTest,
    dataDrivenTests,
    isDataDrivenRunning,
    isLargePayloadTestRunning,
    isLoadTestRunning,
    isSecurityRunning,
    isPerformanceRunning,
    performanceTests,
    securityTests,
    testsCount,
    executeAllTests,
    executeLoadTest,
    executeLargePayloadTest,
  } = useTests(testOptions);

  const isRunningTests = isSecurityRunning || isPerformanceRunning || isDataDrivenRunning;
  const statusCode = extractStatusCode(httpResponse);
  const disabledRunTests =
    isRunningTests || !httpResponse || statusCode < RESPONSE_STATUS.OK || statusCode >= RESPONSE_STATUS.BAD_REQUEST;

  useEffect(() => {
    if (!window.electronAPI?.onWssEvent) return;

    const messagesListener = (event: any) => {
      if (event.type === 'open') {
        setMessages([{ direction: 'system', data: `🟢 Connected to ${event.data}` }]);
        setWssConnected(true);
      } else if (event.type === 'close') {
        setMessages((prevMessages) => [
          { direction: 'system', data: `🔵 Disconnected from ${event.data}` },
          ...prevMessages,
        ]);
        setWssConnected(false);
      } else if (event.type === 'message') {
        setMessages((prevMessages) => [
          { direction: 'received', data: String(event.data), decoded: event.decoded ?? null },
          ...prevMessages,
        ]);
      } else if (event.type === 'error')
        setMessages((prevMessages) => [{ direction: 'system', data: `🔴 ${event.error}` }, ...prevMessages]);
    };

    const ipcRenderer = window.electronAPI.onWssEvent(messagesListener);

    return () => {
      ipcRenderer?.off('wss-event', messagesListener);
    };
  }, []);

  useEffect(() => {
    if (testOptions) executeAllTests();
  }, [testOptions]);

  return (
    <div className="flex flex-col gap-4 py-5 px-7">
      <div className="flex items-center gap-2">
        <Select
          className="font-bold"
          isDisabled={isRunningTests}
          isSearchable={false}
          options={modeOptions}
          placeholder="MODE"
          value={modeOptions.find((option) => option.value == mode)}
          onChange={(option: SelectOption<Mode>) => {
            setMode(option.value);
            reset();
          }}
        />
        {mode === 'HTTP' && (
          <>
            <Button onClick={() => setOpenCurlModal(true)}>Import cURL</Button>
            <Modal isOpen={openCurlModal} onClose={closeCurlModal}>
              <div className="flex flex-col gap-4">
                <h4 className="m-0 dark:text-white">Import cURL</h4>
                <Textarea
                  autoFocus={true}
                  className="min-h-40 font-monospace"
                  placeholder="Enter cURL or paste text"
                  value={curl}
                  onChange={(e) => setCurl(e.target.value)}
                />
                {curlError && <p className="m-0 text-xs text-red-600">{curlError}</p>}
                <div className="flex items-center justify-end gap-4">
                  <Button onClick={importCurl}>Import</Button>
                  <Button buttonType={ButtonType.SECONDARY} onClick={closeCurlModal}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        )}
        <div className="flex-auto flex items-center justify-end gap-4">
          <div
            className="dark:text-white"
            onClick={() => {
              document.documentElement.classList.add('dark');
            }}
          >
            <svg className="hidden dark:block h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <g fill="none" fill-rule="evenodd" transform="translate(-442 -200)">
                <g fill="currentColor" transform="translate(356 144)">
                  <path
                    fill-rule="nonzero"
                    d="M108.5 24C108.5 27.5902136 105.590214 30.5 102 30.5 98.4097864 30.5 95.5 27.5902136 95.5 24 95.5 20.4097864 98.4097864 17.5 102 17.5 105.590214 17.5 108.5 20.4097864 108.5 24zM107 24C107 21.2382136 104.761786 19 102 19 99.2382136 19 97 21.2382136 97 24 97 26.7617864 99.2382136 29 102 29 104.761786 29 107 26.7617864 107 24zM101 12.75L101 14.75C101 15.1642136 101.335786 15.5 101.75 15.5 102.164214 15.5 102.5 15.1642136 102.5 14.75L102.5 12.75C102.5 12.3357864 102.164214 12 101.75 12 101.335786 12 101 12.3357864 101 12.75zM95.7255165 14.6323616L96.7485165 16.4038616C96.9556573 16.7625614 97.4143618 16.8854243 97.7730616 16.6782835 98.1317614 16.4711427 98.2546243 16.0124382 98.0474835 15.6537384L97.0244835 13.8822384C96.8173427 13.5235386 96.3586382 13.4006757 95.9999384 13.6078165 95.6412386 13.8149573 95.5183757 14.2736618 95.7255165 14.6323616zM91.8822384 19.0244835L93.6537384 20.0474835C94.0124382 20.2546243 94.4711427 20.1317614 94.6782835 19.7730616 94.8854243 19.4143618 94.7625614 18.9556573 94.4038616 18.7485165L92.6323616 17.7255165C92.2736618 17.5183757 91.8149573 17.6412386 91.6078165 17.9999384 91.4006757 18.3586382 91.5235386 18.8173427 91.8822384 19.0244835zM90.75 25L92.75 25C93.1642136 25 93.5 24.6642136 93.5 24.25 93.5 23.8357864 93.1642136 23.5 92.75 23.5L90.75 23.5C90.3357864 23.5 90 23.8357864 90 24.25 90 24.6642136 90.3357864 25 90.75 25zM92.6323616 30.2744835L94.4038616 29.2514835C94.7625614 29.0443427 94.8854243 28.5856382 94.6782835 28.2269384 94.4711427 27.8682386 94.0124382 27.7453757 93.6537384 27.9525165L91.8822384 28.9755165C91.5235386 29.1826573 91.4006757 29.6413618 91.6078165 30.0000616 91.8149573 30.3587614 92.2736618 30.4816243 92.6323616 30.2744835zM97.0244835 34.1177616L98.0474835 32.3462616C98.2546243 31.9875618 98.1317614 31.5288573 97.7730616 31.3217165 97.4143618 31.1145757 96.9556573 31.2374386 96.7485165 31.5961384L95.7255165 33.3676384C95.5183757 33.7263382 95.6412386 34.1850427 95.9999384 34.3921835 96.3586382 34.5993243 96.8173427 34.4764614 97.0244835 34.1177616zM103 35.25L103 33.25C103 32.8357864 102.664214 32.5 102.25 32.5 101.835786 32.5 101.5 32.8357864 101.5 33.25L101.5 35.25C101.5 35.6642136 101.835786 36 102.25 36 102.664214 36 103 35.6642136 103 35.25zM108.274483 33.3676384L107.251483 31.5961384C107.044343 31.2374386 106.585638 31.1145757 106.226938 31.3217165 105.868239 31.5288573 105.745376 31.9875618 105.952517 32.3462616L106.975517 34.1177616C107.182657 34.4764614 107.641362 34.5993243 108.000062 34.3921835 108.358761 34.1850427 108.481624 33.7263382 108.274483 33.3676384zM112.117762 28.9755165L110.346262 27.9525165C109.987562 27.7453757 109.528857 27.8682386 109.321717 28.2269384 109.114576 28.5856382 109.237439 29.0443427 109.596138 29.2514835L111.367638 30.2744835C111.726338 30.4816243 112.185043 30.3587614 112.392183 30.0000616 112.599324 29.6413618 112.476461 29.1826573 112.117762 28.9755165zM113.25 23L111.25 23C110.835786 23 110.5 23.3357864 110.5 23.75 110.5 24.1642136 110.835786 24.5 111.25 24.5L113.25 24.5C113.664214 24.5 114 24.1642136 114 23.75 114 23.3357864 113.664214 23 113.25 23zM111.367638 17.7255165L109.596138 18.7485165C109.237439 18.9556573 109.114576 19.4143618 109.321717 19.7730616 109.528857 20.1317614 109.987562 20.2546243 110.346262 20.0474835L112.117762 19.0244835C112.476461 18.8173427 112.599324 18.3586382 112.392183 17.9999384 112.185043 17.6412386 111.726338 17.5183757 111.367638 17.7255165zM106.975517 13.8822384L105.952517 15.6537384C105.745376 16.0124382 105.868239 16.4711427 106.226938 16.6782835 106.585638 16.8854243 107.044343 16.7625614 107.251483 16.4038616L108.274483 14.6323616C108.481624 14.2736618 108.358761 13.8149573 108.000062 13.6078165 107.641362 13.4006757 107.182657 13.5235386 106.975517 13.8822384z"
                    transform="translate(0 48)"
                    stroke="currentColor"
                    stroke-width="0.25"
                  ></path>
                  <path
                    d="M98.6123,60.1372 C98.6123,59.3552 98.8753,58.6427 99.3368,58.0942 C99.5293,57.8657 99.3933,57.5092 99.0943,57.5017 C99.0793,57.5012 99.0633,57.5007 99.0483,57.5007 C97.1578,57.4747 95.5418,59.0312 95.5008,60.9217 C95.4578,62.8907 97.0408,64.5002 98.9998,64.5002 C99.7793,64.5002 100.4983,64.2452 101.0798,63.8142 C101.3183,63.6372 101.2358,63.2627 100.9478,63.1897 C99.5923,62.8457 98.6123,61.6072 98.6123,60.1372"
                    transform="translate(3 11)"
                  ></path>
                </g>
                <polygon points="444 228 468 228 468 204 444 204"></polygon>
              </g>
            </svg>
            <svg className="dark:hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <g fill="none" fill-rule="evenodd" transform="translate(-440 -200)">
                <path
                  fill="currentColor"
                  fill-rule="nonzero"
                  stroke="currentColor"
                  stroke-width="0.5"
                  d="M102,21 C102,18.1017141 103.307179,15.4198295 105.51735,13.6246624 C106.001939,13.2310647 105.821611,12.4522936 105.21334,12.3117518 C104.322006,12.1058078 103.414758,12 102.5,12 C95.8722864,12 90.5,17.3722864 90.5,24 C90.5,30.6277136 95.8722864,36 102.5,36 C106.090868,36 109.423902,34.4109093 111.690274,31.7128995 C112.091837,31.2348572 111.767653,30.5041211 111.143759,30.4810139 C106.047479,30.2922628 102,26.1097349 102,21 Z M102.5,34.5 C96.7007136,34.5 92,29.7992864 92,24 C92,18.2007136 96.7007136,13.5 102.5,13.5 C102.807386,13.5 103.113925,13.5136793 103.419249,13.5407785 C101.566047,15.5446378 100.5,18.185162 100.5,21 C100.5,26.3198526 104.287549,30.7714322 109.339814,31.7756638 L109.516565,31.8092927 C107.615276,33.5209452 105.138081,34.5 102.5,34.5 Z"
                  transform="translate(354.5 192)"
                ></path>
                <polygon points="444 228 468 228 468 204 444 204"></polygon>
              </g>
            </svg>
          </div>
          <Button buttonType={ButtonType.SECONDARY} onClick={() => setOpenReloadModal(true)}>
            <span className="w-fit flex items-center gap-1 mx-auto">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.502 16.6663V13.3333C3.502 12.9661 3.79977 12.6683 4.16704 12.6683H7.50004L7.63383 12.682C7.93691 12.7439 8.16508 13.0119 8.16508 13.3333C8.16508 13.6547 7.93691 13.9227 7.63383 13.9847L7.50004 13.9984H5.47465C6.58682 15.2249 8.21842 16.0013 10 16.0013C13.06 16.0012 15.5859 13.711 15.9551 10.7513L15.9854 10.6195C16.0845 10.3266 16.3785 10.1334 16.6973 10.1732C17.0617 10.2186 17.3198 10.551 17.2745 10.9154L17.2247 11.2523C16.6301 14.7051 13.6224 17.3313 10 17.3314C8.01103 17.3314 6.17188 16.5383 4.83208 15.2474V16.6663C4.83208 17.0335 4.53411 17.3311 4.16704 17.3314C3.79977 17.3314 3.502 17.0336 3.502 16.6663ZM4.04497 9.24935C3.99936 9.61353 3.66701 9.87178 3.30278 9.8265C2.93833 9.78105 2.67921 9.44876 2.72465 9.08431L4.04497 9.24935ZM10 2.66829C11.9939 2.66833 13.8372 3.46551 15.1778 4.76204V3.33333C15.1778 2.96616 15.4757 2.66844 15.8428 2.66829C16.2101 2.66829 16.5079 2.96606 16.5079 3.33333V6.66634C16.5079 7.03361 16.2101 7.33138 15.8428 7.33138H12.5098C12.1425 7.33138 11.8448 7.03361 11.8448 6.66634C11.8449 6.29922 12.1426 6.0013 12.5098 6.0013H14.5254C13.4133 4.77488 11.7816 3.99841 10 3.99837C6.93998 3.99837 4.41406 6.28947 4.04497 9.24935L3.38481 9.16634L2.72465 9.08431C3.17574 5.46702 6.26076 2.66829 10 2.66829Z"></path>
              </svg>
              Reload
            </span>
          </Button>
          <Modal className="[&>div]:w-[400px]!" isOpen={openReloadModal} onClose={closeReloadModal}>
            <div className="flex flex-col gap-4">
              <h4 className="m-0 dark:text-white">Reload</h4>
              <p className="m-0 text-sm dark:text-white">All current data will be lost</p>
              <div className="flex items-center justify-end gap-4">
                <Button buttonType={ButtonType.DANGER} onClick={() => window.electronAPI.reloadApp()}>
                  Reload
                </Button>
                <Button buttonType={ButtonType.SECONDARY} onClick={closeReloadModal}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-auto flex items-center">
          {mode === 'HTTP' && (
            <Select
              className="font-bold uppercase"
              classNames={{
                control: () =>
                  cn(
                    'min-h-auto! bg-white! border! border-border! rounded-none! rounded-l-md! shadow-none!',
                    'dark:bg-[#343a46]! dark:border-[#343a46]! dark:border-r-[#23272f]!',
                  ),
                input: () => 'm-0! p-0! [&>:first-child]:uppercase text-black! dark:text-white!',
              }}
              isCreatable={true}
              options={methodOptions}
              placeholder="METHOD"
              value={methodOptions.find((option) => option.value == method)}
              onChange={(option: SelectOption<Method>) => setMethod(option.value)}
            />
          )}
          <Input
            className={cn('flex-auto font-monospace', { 'border-l-0! rounded-l-none!': mode === 'HTTP' })}
            placeholder="Enter URL or paste text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        {mode === 'HTTP' && (
          <Button disabled={!url || isRunningTests} onClick={sendHttp}>
            Send
          </Button>
        )}
        {mode === 'WSS' && (
          <>
            <Button
              buttonType={wssConnected ? ButtonType.SECONDARY : ButtonType.PRIMARY}
              disabled={!wssConnected && !url}
              onClick={wssConnected ? window.electronAPI.disconnectWss : connectWss}
            >
              {wssConnected ? 'Disconnect' : 'Connect'}
            </Button>
            <Button disabled={!wssConnected} onClick={sendWss}>
              Send
            </Button>
          </>
        )}
      </div>

      <TextareaAutosize
        className="font-monospace"
        maxRows={10}
        placeholder="Header-Key: value"
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />

      <div className="relative">
        <TextareaAutosize
          className="font-monospace"
          maxRows={15}
          placeholder={mode === 'HTTP' ? 'Enter request body (JSON or Form Data)' : 'Message body'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          className="absolute top-3 right-4 min-w-auto! py-0.5! px-2! rounded-sm"
          buttonType={ButtonType.SECONDARY}
          onClick={() => setBody((prevBody) => formatBody(prevBody, parseHeaders(headers)))}
        >
          Beautify
        </Button>
      </div>

      {mode === 'HTTP' && (
        <div>
          <label className="block mb-1 font-bold text-sm dark:text-white">Protobuf Schema & Message Type</label>
          <div className="mb-3 text-xs text-gray-500/80 dark:text-[#99a1b3]">
            Experimental and optional section. If used, both fields must be completed
          </div>
          <div className="flex items-center">
            <Input
              accept=".proto"
              className="font-monospace rounded-r-none! dark:border-r-[#23272f]!"
              type="file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const fileExtension = file.name.split('.').pop().toLowerCase();
                if (fileExtension !== 'proto') return;

                try {
                  await loadProtoSchema(file);

                  setProtoFile(file);
                  setMessages((prevMessages) => [
                    { direction: 'system', data: '🟢 Proto schema loaded' },
                    ...prevMessages,
                  ]);
                } catch (error) {
                  setMessages((prevMessages) => [
                    { direction: 'system', data: '🔴 Failed to parse proto: ' + error },
                    ...prevMessages,
                  ]);
                }
              }}
            />

            <Input
              className="flex-auto font-monospace border-l-0! rounded-l-none!"
              placeholder="Message type (e.g. mypackage.MyMessage)"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
            />
          </div>
        </div>
      )}

      {mode === 'HTTP' && httpResponse && (
        <ResponsePanel title="Response">
          <div
            className={cn(
              'flex items-center gap-2 p-4 font-bold dark:text-white bg-body dark:bg-[#23272f] border-t border-border dark:border-[#23272f]',
              {
                'text-green-500!': httpResponse.status.startsWith('2'),
                'text-blue-500!': httpResponse.status.startsWith('3'),
                'text-orange-500!': httpResponse.status.startsWith('4'),
                'text-red-500!': httpResponse.status.startsWith('5') || httpResponse.status === NETWORK_ERROR,
              },
            )}
          >
            {httpResponse.status === SENDING && <Loader className="h-5! w-5!" />}
            {httpResponse.status}
          </div>
          {httpResponse.status !== SENDING && (
            <div className="grid grid-cols-2 items-stretch max-h-[450px] py-4 border-t border-border dark:border-[#23272f] overflow-y-auto">
              <div className="relative flex-1 px-4">
                <h4 className="m-0 mb-4 dark:text-white">Headers</h4>
                {httpResponse.headers && (
                  <CopyButton
                    className="absolute top-0 right-4"
                    textToCopy={JSON.stringify(httpResponse.headers, null, 2)}
                  >
                    Copy
                  </CopyButton>
                )}
                <JsonViewer source={httpResponse.headers} />
              </div>
              <div className="relative flex-1 px-4 border-l border-border dark:border-[#23272f]">
                <h4 className="m-0 mb-4 dark:text-white">Body</h4>
                {httpResponse.body && (
                  <CopyButton
                    className="absolute top-0 right-4"
                    textToCopy={
                      typeof httpResponse.body === 'string'
                        ? httpResponse.body
                        : JSON.stringify(httpResponse.body, null, 2)
                    }
                  >
                    Copy
                  </CopyButton>
                )}
                <JsonViewer source={extractBodyFromResponse(httpResponse)} />
              </div>
            </div>
          )}
        </ResponsePanel>
      )}

      {messages.length > 0 && (
        <ResponsePanel title="Messages">
          <div className="max-h-[400px] p-4 text-xs border-t border-border dark:border-[#23272f] overflow-y-auto">
            {messages.map(({ data, decoded, direction }, index) => (
              <div
                key={index}
                className="not-first:pt-3 not-last:pb-3 border-b last:border-none border-border dark:border-[#23272f]"
              >
                <div className="flex items-center gap-4">
                  {direction !== 'system' && (
                    <span
                      className={cn('w-5 h-5 font-bold rounded-xs text-center leading-normal rotate-90', {
                        'text-method-post bg-method-post/10': direction === 'sent',
                        'text-method-put bg-method-put/10': direction === 'received',
                      })}
                    >
                      {direction === 'sent' ? '⬅' : direction === 'received' ? '➡' : ''}
                    </span>
                  )}
                  <div>
                    <pre className="my-0 dark:text-white whitespace-pre-wrap break-all">{data}</pre>
                    {decoded && (
                      <>
                        <div className="mt-2 dark:text-white font-monospace font-bold">Decoded Protobuf:</div>
                        <pre className="my-0 dark:text-white whitespace-pre-wrap break-all">dfd</pre>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ResponsePanel>
      )}

      {(Object.keys(bodyMappings).length > 0 || Object.keys(queryMappings).length > 0) && (
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {Object.keys(bodyMappings).length > 0 && (
            <ParametersPanel
              title="Body Parameters"
              mappings={bodyMappings}
              onFieldTypeChange={(key, value) =>
                setBodyMappings((prevBodyMappings) => ({
                  ...prevBodyMappings,
                  [key]: value,
                }))
              }
              onRemoveClick={(key) =>
                setBodyMappings((prevBodyMappings) => ({
                  ...prevBodyMappings,
                  [key]: 'do-not-test',
                }))
              }
            />
          )}

          {Object.keys(queryMappings).length > 0 && (
            <ParametersPanel
              title="Query Parameters"
              mappings={queryMappings}
              onFieldTypeChange={(key, value) =>
                setQueryMappings((prevQueryMappings) => ({
                  ...prevQueryMappings,
                  [key]: value,
                }))
              }
              onRemoveClick={(key) =>
                setQueryMappings((prevQueryMappings) => ({
                  ...prevQueryMappings,
                  [key]: 'do-not-test',
                }))
              }
            />
          )}
        </div>
      )}

      {mode === 'HTTP' && (
        <div>
          <Button
            disabled={disabledRunTests}
            onClick={() =>
              setTestOptions({ body, headers, method, bodyMappings, queryMappings, messageType, protoFile, url })
            }
          >
            {isRunningTests ? `Running tests... (${currentTest}/${testsCount})` : 'Generate & Run Tests'}
          </Button>
        </div>
      )}

      {testOptions && (
        <>
          <ResponsePanel title="Security Tests">
            <TestsTable
              columns={[
                ...getTestsTableColumns(['Check', 'Expected', 'Actual']),
                {
                  name: 'Result',
                  selector: (row) => row.status,
                  width: '150px',
                  cell: (row) => {
                    if (row.name === LARGE_PAYLOAD_TEST_NAME)
                      return (
                        <LargePayloadTestControls
                          isRunning={isLargePayloadTestRunning}
                          executeTest={(size: number) =>
                            executeLargePayloadTest({ ...testOptions, bodyMappings, queryMappings }, size)
                          }
                        />
                      );

                    return row.status;
                  },
                },
              ]}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
              expandOnRowClicked
              data={securityTests}
              progressComponent={<TestRunningLoader text="Running Security Tests..." />}
              progressPending={isSecurityRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="Performance Insights">
            <TestsTable
              columns={[
                ...getTestsTableColumns(['Check', 'Expected']),
                {
                  name: 'Actual',
                  selector: (row) => row.actual,
                  cell: (row) => <div className="py-1">{row.actual}</div>,
                },
                {
                  name: 'Result',
                  selector: (row) => row.status,
                  width: '220px',
                  cell: (row) => {
                    if (row.name === LOAD_TEST_NAME)
                      return (
                        <LoadTestControls
                          isRunning={isLoadTestRunning}
                          executeTest={(threadCount: number, requestCount: number) =>
                            executeLoadTest({ ...testOptions, bodyMappings, queryMappings }, threadCount, requestCount)
                          }
                        />
                      );

                    return row.status;
                  },
                },
              ]}
              data={performanceTests}
              progressComponent={<TestRunningLoader text="Running Performance Insights..." />}
              progressPending={isPerformanceRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="Data-Driven Tests">
            <TestsTable
              columns={getTestsTableColumns(['Field', 'Value', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
              expandOnRowClicked
              data={dataDrivenTests}
              fixedHeader={true}
              fixedHeaderScrollHeight="720px"
              progressComponent={<TestRunningLoader text="Running Data-Driven Tests..." />}
              progressPending={isDataDrivenRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="CRUD">
            <TestsTable
              columns={getTestsTableColumns(['Method', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
              expandOnRowClicked
              data={crudTests}
              progressComponent={<TestRunningLoader text="Preparing CRUD…" />}
              progressPending={crudTests.length === 0}
            />
          </ResponsePanel>
        </>
      )}
    </div>
  );

  function reset() {
    setMethod('GET');
    setUrl('');
    setWssConnected(false);
    setHeaders('');
    setBody('{}');
    setProtoFile(null);
    setMessageType('');
    setHttpResponse(null);
    setMessages([]);
    setBodyMappings({});
    setQueryMappings({});
    setTestOptions(null);
  }

  function importCurl() {
    try {
      if (curl.length > 200_000) throw new Error('cURL too large');

      const { body, decodedLines, headers, method, url } = extractCurl(curl);

      setUrl(url);
      setMethod(method as Method);
      setHeaders(
        Object.entries(headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
      );

      if (decodedLines.length > 0) setBody(decodedLines.join('\n'));
      else {
        const trimmedBody = body ? String(body).trim() : '';
        setBody(trimmedBody !== '' ? trimmedBody : '{}');
      }

      closeCurlModal();
    } catch (error) {
      console.error('cURL import failed', error);
      setCurlError('The cURL command you provided appears to be invalid. Please check it and try again');
    }
  }

  function closeCurlModal() {
    setOpenCurlModal(false);
    setCurl('');
    setCurlError('');
  }

  function closeReloadModal() {
    setOpenReloadModal(false);
  }

  async function sendHttp() {
    setHttpResponse({
      status: SENDING,
      body: '',
      headers: {},
    });
    setBodyMappings({});
    setQueryMappings({});

    try {
      const parsedHeaders = parseHeaders(headers);
      const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
      const request = createHttpRequest(parsedBody, parsedHeaders, method, url);
      const response: HttpResponse = await window.electronAPI.sendHttp(request);

      setHttpResponse(response);

      if (!response.status.startsWith('2')) return;

      const bodyMappings = extractBodyFieldMappings(parsedBody, parsedHeaders);
      const queryMappings = Object.fromEntries(
        Object.entries(extractQueryParameters(url)).map(([key, value]) => [key, detectFieldType(value)]),
      );

      setBodyMappings(bodyMappings);
      setQueryMappings(queryMappings);
    } catch (error) {
      setHttpResponse({
        status: NETWORK_ERROR,
        body: String(error),
        headers: {},
      });
    }
  }

  function connectWss() {
    if (!url.startsWith('ws')) {
      setMessages((prevMessages) => [
        { direction: 'system', data: '🔴 Please use ws:// or wss:// URL' },
        ...prevMessages,
      ]);
      return;
    }

    window.electronAPI.connectWss({ url, headers: parseHeaders(headers) });
  }

  function sendWss() {
    setMessages((prevMessages) => [{ direction: 'sent', data: body }, ...prevMessages]);
    window.electronAPI.sendWss(body);
  }
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clamp } from '../../utils';
import Input from '../inputs/Input';
import { Controls } from './Controls';

interface Props {
  isRunning: boolean;
  executeTest: (threadCount: number, requestCount: number) => Promise<void>;
}

export function LoadTestControls({ isRunning, executeTest }: Props) {
  const { t } = useTranslation();
  const [threadCount, setThreadCount] = useState(10);
  const [requestCount, setRequestCount] = useState(100);

  return (
    <Controls isRunning={isRunning} executeTest={() => executeTest(threadCount, requestCount)}>
      <div>
        <label className="block mb-0.5 font-bold text-[10px]">{t('controls.threads')}</label>
        <Input
          className="w-12 p-0.5 text-center"
          title={t('controls.threadsMax')}
          type="number"
          value={threadCount}
          onChange={(event) => setThreadCount(clamp(Number(event.target.value), 1, 100))}
        />
      </div>

      <div>
        <label className="block mb-0.5 font-bold text-[10px]">{t('controls.requests')}</label>
        <Input
          className="w-16 p-0.5 text-center"
          type="number"
          title={t('controls.requestsMax')}
          value={requestCount}
          onChange={(event) => setRequestCount(clamp(Number(event.target.value), 1, 10000))}
        />
      </div>
    </Controls>
  );
}

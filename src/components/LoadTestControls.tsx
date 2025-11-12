import { useState } from 'react';
import Button from './buttons/Button';
import Input from './inputs/Input';
import TestRunningLoader from './loaders/TestRunningLoader';

interface Props {
  isRunning: boolean;
  executeTest: (threadCount: number, requestCount: number) => Promise<void>;
}

export function LoadTestControls({ isRunning, executeTest }: Props) {
  const [threadCount, setThreadCount] = useState(10);
  const [requestCount, setRequestCount] = useState(100);

  return (
    <div className="flex items-end gap-1.5">
      <div>
        <label className="block mb-0.5 font-bold text-[10px]">Threads</label>
        <Input
          className="w-12! p-0.5! text-center!"
          max={100}
          min={1}
          title="Threads (max 100)"
          type="number"
          value={threadCount}
          onChange={(e) => setThreadCount(Math.min(100, Math.max(1, Number(e.target.value))))}
        />
      </div>

      <div>
        <label className="block mb-0.5 font-bold text-[10px]">Requests</label>
        <Input
          className="w-16! p-0.5! text-center!"
          type="number"
          min={1}
          max={10000}
          title="Total requests (max 10 000)"
          value={requestCount}
          onChange={(e) => setRequestCount(Math.min(10000, Math.max(1, Number(e.target.value))))}
        />
      </div>

      <Button
        className="min-w-auto! py-0.5! px-2!"
        disabled={isRunning}
        onClick={() => executeTest(threadCount, requestCount)}
      >
        {isRunning ? <TestRunningLoader className="p-0!" /> : 'Run'}
      </Button>
    </div>
  );
}

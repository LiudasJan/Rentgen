import { useState } from 'react';
import Input from '../inputs/Input';
import { Controls } from './Controls';

interface Props {
  isRunning: boolean;
  executeTest: (threadCount: number, requestCount: number) => Promise<void>;
}

export function LoadTestControls({ isRunning, executeTest }: Props) {
  const [threadCount, setThreadCount] = useState(10);
  const [requestCount, setRequestCount] = useState(100);

  return (
    <Controls isRunning={isRunning} executeTest={() => executeTest(threadCount, requestCount)}>
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
    </Controls>
  );
}

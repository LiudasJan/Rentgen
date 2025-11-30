import { useState } from 'react';
import { clamp } from '../../utils/number';
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
          title="Threads (max 100)"
          type="number"
          value={threadCount}
          onChange={(e) => setThreadCount(clamp(Number(e.target.value), 1, 100))}
        />
      </div>

      <div>
        <label className="block mb-0.5 font-bold text-[10px]">Requests</label>
        <Input
          className="w-16! p-0.5! text-center!"
          type="number"
          title="Total requests (max 10 000)"
          value={requestCount}
          onChange={(e) => setRequestCount(clamp(Number(e.target.value), 1, 10000))}
        />
      </div>
    </Controls>
  );
}

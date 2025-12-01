import { useState } from 'react';
import { clamp } from '../../utils/number';
import Input from '../inputs/Input';
import { Controls } from './Controls';

const MAX_PAYLOAD_SIZE_MB = 100;

interface Props {
  isRunning: boolean;
  executeTest: (size: number) => Promise<void>;
}

export function LargePayloadTestControls({ isRunning, executeTest }: Props) {
  const [size, setSize] = useState(10);

  return (
    <Controls isRunning={isRunning} executeTest={() => executeTest(size)}>
      <div>
        <label className="block mb-0.5 font-bold text-[10px]">Size (MB)</label>
        <Input
          className="w-16! p-0.5! text-center!"
          type="number"
          title={`Size (max ${MAX_PAYLOAD_SIZE_MB} MB)`}
          value={size}
          onChange={(event) => setSize(clamp(Number(event.target.value), 1, MAX_PAYLOAD_SIZE_MB))}
        />
      </div>
    </Controls>
  );
}

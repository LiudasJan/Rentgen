interface Props {
  text?: string;
}

export default function TestRunningLoader({ text }: Props) {
  return (
    <div className="w-full p-4 flex items-center gap-2">
      <span className="animate-spin">⏳</span> {text || 'Running tests...'}
    </div>
  );
}

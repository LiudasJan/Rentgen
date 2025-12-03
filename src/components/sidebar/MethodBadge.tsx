import cn from 'classnames';

const methodColorMap: Record<string, string> = {
  GET: 'text-method-get bg-method-get/10',
  POST: 'text-method-post bg-method-post/10',
  PUT: 'text-method-put bg-method-put/10',
  PATCH: 'text-method-patch bg-method-patch/10',
  DELETE: 'text-method-delete bg-method-delete/10',
  HEAD: 'text-method-head bg-method-head/10',
  OPTIONS: 'text-method-options bg-method-options/10',
};

interface MethodBadgeProps {
  method: string;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'px-1.5 py-0.5 text-xs font-bold rounded shrink-0',
        methodColorMap[method.toUpperCase()] || 'text-text',
      )}
    >
      {method}
    </span>
  );
}

import cn from 'classnames';

const methodColorMap: Record<string, string> = {
  GET: 'text-method-get dark:text-dark-method-get bg-method-get/10',
  POST: 'text-method-post dark:text-dark-method-post bg-method-post/10',
  PUT: 'text-method-put dark:text-dark-method-put bg-method-put/10',
  PATCH: 'text-method-patch dark:text-dark-method-patch bg-method-patch/10',
  DELETE: 'text-method-delete dark:text-dark-method-delete bg-method-delete/10',
  HEAD: 'text-method-head dark:text-dark-method-head bg-method-head/10',
  OPTIONS: 'text-method-options dark:text-dark-method-options bg-method-options/10',
};

interface MethodBadgeProps {
  method: string;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'px-1.5 py-0.5 text-xs font-bold rounded shrink-0',
        methodColorMap[method.toUpperCase()] || 'text-text dark:text-dark-text',
      )}
    >
      {method}
    </span>
  );
}

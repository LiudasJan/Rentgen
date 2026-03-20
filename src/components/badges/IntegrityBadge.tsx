import { IntegrityStatus } from '../../types';

export default function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  switch (status) {
    case 'verified':
      return <span className="text-green-600 dark:text-green-400 text-xs font-medium">Verified</span>;
    case 'modified':
      return <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">Modified</span>;
    case 'missing':
      return <span className="text-text-secondary text-xs font-medium">No checksum</span>;
  }
}

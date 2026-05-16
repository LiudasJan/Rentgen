import { useTranslation } from 'react-i18next';
import { IntegrityStatus } from '../../types';

export default function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  const { t } = useTranslation();
  switch (status) {
    case 'verified':
      return <span className="text-green-600 dark:text-green-400 text-xs font-medium">{t('badges.verified')}</span>;
    case 'modified':
      return <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">{t('badges.modified')}</span>;
    case 'missing':
      return <span className="text-text-secondary text-xs font-medium">{t('badges.noChecksum')}</span>;
  }
}

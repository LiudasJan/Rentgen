import GearIcon from '../../assets/icons/gear-icon.svg';

export function SecurityTestsSettings() {
  return (
    <div className="flex flex-col gap-4">
      <h5 className="m-0 pb-1 border-b border-b-border dark:border-b-dark-border">Security Tests</h5>
      <div className="flex items-center gap-2 text-sm">
        <GearIcon className="w-4 h-4" /> In Progress...
      </div>
    </div>
  );
}

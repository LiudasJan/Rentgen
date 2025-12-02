import CollectionIcon from '../../assets/icons/collection-icon.svg';

interface SidebarIconRailProps {
  onToggle: () => void;
}

export default function SidebarIconRail({ onToggle }: SidebarIconRailProps) {
  return (
    <div className="w-[80px] shrink-0 flex flex-col py-4.5">
      <div
        className="flex items-center justify-center h-[50px] cursor-pointer hover:bg-button-secondary dark:hover:bg-dark-input"
        onClick={onToggle}
      >
        <div className="flex flex-col items-center justify-center gap-1 text-center p-1">
          <CollectionIcon className="w-5 h-5 text-gray-800 dark:text-white" />
          <span className="text-[0.5rem] font-bold text-text dark:text-dark-text uppercase tracking-wide">
            Collections
          </span>
        </div>
      </div>
    </div>
  );
}

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
          <svg
            className="w-5 h-5 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 8v1h4V8m4 7H4a1 1 0 0 1-1-1V5h14v9a1 1 0 0 1-1 1ZM2 1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"
            />
          </svg>
          <span className="text-[0.5rem] font-bold text-text dark:text-dark-text uppercase tracking-wide">
            Collections
          </span>
        </div>
      </div>
    </div>
  );
}

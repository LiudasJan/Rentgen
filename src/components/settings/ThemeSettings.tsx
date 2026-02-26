import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';

import DarkImage from '../../assets/images/dark-theme.svg';
import LightTheme from '../../assets/images/light-theme.svg';

const themes = [
  { label: 'Light', value: 'light' as const, Image: LightTheme },
  { label: 'Dark', value: 'dark' as const, Image: DarkImage },
];

export function ThemeSettings() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const onThemeChange = (value: 'light' | 'dark') => {
    if (value === theme) return;

    dispatch(settingsActions.setTheme(value));
  };

  return (
    <div className="flex border border-border dark:border-dark-border rounded-md divide-x divide-border dark:divide-dark-border overflow-hidden">
      {themes.map(({ Image, label, value }) => (
        <label
          key={value}
          className={cn(
            'flex-1 flex flex-col gap-2 p-3 hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer',
            { 'bg-button-secondary': value === theme, 'dark:bg-dark-input': value === theme },
          )}
        >
          <Image
            className={cn('p-0.5 border-2 rounded-lg', {
              'border-amber-600': value === theme,
              'border-transparent': value !== theme,
            })}
          />
          <span className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              className="m-0"
              type="radio"
              name="theme"
              value={value}
              checked={value === theme}
              onChange={() => onThemeChange(value)}
            />
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}

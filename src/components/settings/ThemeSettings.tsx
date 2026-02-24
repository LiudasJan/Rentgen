import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';

import DarkImage from '../../assets/images/dark-theme.svg';
import LightTheme from '../../assets/images/light-theme.svg';

export function ThemeSettings() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const isDark = theme === 'dark';

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-2 cursor-pointer">
        <LightTheme
          className={cn('p-0.5 border-2 rounded-lg', { 'border-amber-600': !isDark, 'border-transparent': isDark })}
          onClick={() => dispatch(settingsActions.setTheme('light'))}
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            className="m-0"
            type="radio"
            name="theme"
            value="light"
            checked={!isDark}
            onChange={() => dispatch(settingsActions.setTheme('light'))}
          />
          Light
        </label>
      </div>
      <div className="flex-1 flex flex-col gap-2 cursor-pointer">
        <DarkImage
          className={cn('p-0.5 border-2 rounded-lg', { 'border-amber-600': isDark, 'border-transparent': !isDark })}
          onClick={() => dispatch(settingsActions.setTheme('dark'))}
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            className="m-0"
            type="radio"
            name="theme"
            value="dark"
            checked={isDark}
            onChange={() => dispatch(settingsActions.setTheme('dark'))}
          />
          Dark
        </label>
      </div>
    </div>
  );
}

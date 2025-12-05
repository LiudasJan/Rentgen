import cn from 'classnames';
import { ReactNode, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button, { Props as ButtonProps, ButtonSize, ButtonType } from './Button';

interface Props extends ButtonProps {
  copiedFallback?: ReactNode;
  textToCopy: string;
}

export function CopyButton({
  buttonType = ButtonType.SECONDARY,
  buttonSize = ButtonSize.SMALL,
  children,
  className,
  copiedFallback,
  textToCopy,
  ...otherProps
}: Props) {
  const [copied, setCopied] = useState<boolean>(false);
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <Button
      className={twMerge(cn('min-w-auto whitespace-nowrap', className))}
      buttonType={buttonType}
      buttonSize={buttonSize}
      {...otherProps}
      onClick={copyToClipboard}
    >
      {copied ? (copiedFallback ?? 'Copied ✅') : children}
    </Button>
  );

  function copyToClipboard() {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error('Failed to copy clipboard', error);
      });
  }
}

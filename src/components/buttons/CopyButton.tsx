import cn from 'classnames';
import { useState } from 'react';
import Button, { Props as ButtonProps, ButtonType } from './Button';

interface Props extends ButtonProps {
  textToCopy: string;
}

let copiedTimeout: NodeJS.Timeout;

export function CopyButton({
  className,
  buttonType = ButtonType.SECONDARY,
  children,
  textToCopy,
  ...otherProps
}: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <Button
      className={cn('min-w-auto! py-0.5! px-2! rounded-sm', className)}
      buttonType={buttonType}
      {...otherProps}
      onClick={copyToClipboard}
    >
      {copied ? 'Copied ✅' : children}
    </Button>
  );

  function copyToClipboard() {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log('✅ Copied to clipboard');
        setCopied(true);
        clearTimeout(copiedTimeout);
        copiedTimeout = setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error('❌ Failed to copy clipboard', error);
      });
  }
}

import { PropsWithChildren } from 'react';
import Button, { ButtonType } from '../buttons/Button';
import Modal, { Props as ModalProps } from './Modal';

export interface Props extends ModalProps, PropsWithChildren {
  cancelText?: string;
  confirmText?: string;
  confirmType?: ButtonType;
  description?: string;
  title?: string;
  onConfirm(): void;
}

export default function ConfirmationModal({
  cancelText,
  children,
  confirmText,
  confirmType = ButtonType.DANGER,
  description,
  isOpen,
  title,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal className="[&>div]:w-[400px]!" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {title && <h4 className="m-0">{title}</h4>}
        {description && <p className="m-0 text-sm dark:text-text-secondary">{description}</p>}
        {children}
        <div className="flex items-center justify-end gap-4">
          <Button buttonType={confirmType} onClick={onConfirm}>
            {confirmText || 'OK'}
          </Button>
          <Button buttonType={ButtonType.SECONDARY} onClick={onClose}>
            {cancelText || 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

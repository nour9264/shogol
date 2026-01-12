'use client';

import { useToast } from '@/context/ToastContext';
import Modal from './Modal';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.length > 0 && (
        <Modal
          key={`modal-${toasts[0].id}`}
          message={toasts[0].message}
          type={toasts[0].type}
          duration={toasts[0].duration}
          onClose={() => {
            removeToast(toasts[0].id);
          }}
        />
      )}
    </>
  );
};

export default ToastContainer;


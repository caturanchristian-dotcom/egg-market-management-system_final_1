import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Notification({
  message,
  type,
  isOpen,
  onClose,
  duration = 5000
}: NotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-4 md:top-8 left-1/2 z-[300] w-[calc(100%-2rem)] md:w-auto md:min-w-[320px] max-w-md p-4 rounded-2xl border shadow-2xl flex items-center gap-3 ${bgColors[type]} backdrop-blur-md bg-opacity-95`}
        >
          <div className="shrink-0 p-2 bg-white rounded-xl shadow-sm">{icons[type]}</div>
          <p className="flex-1 text-sm font-bold text-emerald-900 leading-tight">{message}</p>
          <button onClick={onClose} className="p-1 text-emerald-300 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-100/50">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex shadow-2xl items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-400 rounded-2xl shadow-xl p-6 w-86 sm:w-96 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-white">{title}</h2>
            <p className="mb-6 text-white">{message}</p>
            <div className="flex justify-center gap-4">
              <motion.button
                onClick={onConfirm}
                whileHover={{ y: -3, boxShadow: "0 8px 15px rgba(0,0,0,0.3)" }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg transition-transform"
              >
                {confirmLabel}
              </motion.button>
              <motion.button
                onClick={onCancel}
                whileHover={{ y: -3, boxShadow: "0 8px 15px rgba(0,0,0,0.2)" }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg transition-transform"
              >
                {cancelLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

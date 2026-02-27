"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DashboardAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  isSuccess: boolean;
}

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg   " fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg   " fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DashboardAlertModal = ({ isOpen, onClose, message, isSuccess }: DashboardAlertModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center"
          >
            <div className={`mx-auto flex items-center justify-center h-16 w-16 ${isSuccess ? "bg-green-100" : "bg-red-100"} mb-5`}>
              {isSuccess ? (
                <CheckIcon className="h-8 w-8 text-green-600" />
              ) : (
                <XIcon className="h-8 w-8 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{isSuccess ? "Success!" : "Operation Failed"}</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardAlertModal;

"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ",
    };

    const colors = {
        success: "bg-success text-white",
        error: "bg-danger text-white",
        info: "bg-primary text-white",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl min-w-[280px]",
                colors[type],
            )}
        >
            <span className="text-lg font-bold">{icons[type]}</span>
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-auto opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-lg"
            >
                ✕
            </button>
        </motion.div>
    );
}

// Hook for easy toast usage
export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
    };

    const ToastContainer = () => (
        <AnimatePresence>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </AnimatePresence>
    );

    return { showToast, ToastContainer };
}

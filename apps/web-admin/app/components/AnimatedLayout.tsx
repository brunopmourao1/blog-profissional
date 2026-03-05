"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const pageVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
        },
    },
};

export function AnimatedLayout({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
        >
            {children}
        </motion.div>
    );
}

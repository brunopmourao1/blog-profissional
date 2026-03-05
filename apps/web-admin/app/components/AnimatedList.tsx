"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
};

interface AnimatedListProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedList({ children, className = "" }: AnimatedListProps) {
    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

export function AnimatedListItem({ children, className = "" }: AnimatedListProps) {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
}

"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.97,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    index?: number;
}

export function AnimatedCard({ children, className = "", index = 0 }: AnimatedCardProps) {
    return (
        <motion.div
            className={className}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.08 }}
            whileHover={{
                y: -2,
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                transition: { duration: 0.2 },
            }}
        >
            {children}
        </motion.div>
    );
}

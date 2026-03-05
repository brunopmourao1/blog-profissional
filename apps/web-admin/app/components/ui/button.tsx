import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const buttonVariants = {
    base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
    variant: {
        default: "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md",
        destructive: "bg-danger text-white shadow-sm hover:bg-danger/90",
        outline: "border border-border bg-card text-text-primary shadow-sm hover:bg-body hover:shadow",
        secondary: "bg-body text-text-primary hover:bg-input",
        ghost: "text-text-secondary hover:bg-body hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
    },
    size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-8 text-base rounded-xl",
        icon: "h-10 w-10",
    },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    buttonVariants.base,
                    buttonVariants.variant[variant],
                    buttonVariants.size[size],
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };

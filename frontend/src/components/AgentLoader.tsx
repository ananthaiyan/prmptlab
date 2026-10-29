
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AgentLoader({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const [text, setText] = useState("");
    const reducedMotion = useReducedMotion();
    const message = "Initializing AI agent...";

    useEffect(() => {
        if (reducedMotion) {
            const timeout = setTimeout(() => onComplete?.(), 500);
            return () => clearTimeout(timeout);
        }

        let index = 0;
        let typingTimeout: ReturnType<typeof setTimeout>;
        let finishTimeout: ReturnType<typeof setTimeout>;

        const type = () => {
            index++;
            setText(message.slice(0, index));

            if (index < message.length) {
                typingTimeout = setTimeout(type, 25);
            } else {
                finishTimeout = setTimeout(() => onComplete?.(), 350);
            }
        };

        typingTimeout = setTimeout(type, 100);

        return () => {
            clearTimeout(typingTimeout);
            clearTimeout(finishTimeout);
        };
    }, [onComplete, reducedMotion]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07070b] text-white"
        >
            <div className="flex flex-col items-center gap-5">
                <motion.div
                    animate={reducedMotion ? {} : { scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10"
                >
                    <Sparkles className="h-5 w-5 text-blue-400" />
                </motion.div>

                <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    <span>{text}</span>
                    <span className="h-3.5 w-[2px] animate-pulse bg-blue-400" />
                </div>
            </div>
        </motion.div>
    );
}

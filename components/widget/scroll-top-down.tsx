"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function ScrollTopDown() {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<"scroll-down" | "back-to-top">(
    "scroll-down"
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const halfViewport = viewportHeight * 0.5;
      const doubleViewport = viewportHeight * 2;
      const fullViewport = viewportHeight;

      // Determine visibility and mode
      if (currentScrollY <= halfViewport) {
        // Within first 50vh - show scroll down
        setIsVisible(true);
        setMode("scroll-down");
      } else if (currentScrollY >= doubleViewport) {
        // Past 200vh - show back to top
        setIsVisible(true);
        setMode("back-to-top");
      } else {
        // Between 50vh and 100vh - hidden
        setIsVisible(false);
      }
    };

    // Initial check
    handleScroll();

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, []);

  const handleClick = () => {
    if (mode === "scroll-down") {
      // Scroll to 100vh from top
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    } else {
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleClick}
            className="flex flex-col items-center gap-4 transition-all duration-200 cursor-pointer"
            aria-label={mode === "scroll-down" ? "Scroll down" : "Back to top"}
          >
            {mode === "scroll-down" ? (
              <>
                <h6 className="text-sm font-light tracking-wider [writing-mode:vertical-lr] uppercase">
                  {["s", "c", "r", "o", "l", "l"].map((letter, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.08, delay: index * 0.07 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </h6>
                {/* Animated arrow growing from top to bottom */}
                <motion.svg
                  width="12"
                  height="48"
                  viewBox="0 0 12 48"
                  fill="none"
                  className="self-start select-none overflow-visible"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: 0.5 }}
                >
                  <motion.path
                    d="M6 0 L6 42 L11 36"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                  />
                </motion.svg>
              </>
            ) : (
              <>
                {/* Animated arrow growing from bottom to top */}
                <motion.svg
                  width="12"
                  height="48"
                  viewBox="0 0 12 48"
                  fill="none"
                  className="self-start select-none overflow-visible"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: 0.28 }}
                >
                  <motion.path
                    d="M6 48 L6 6 L11 12"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
                  />
                </motion.svg>
                <h6 className="text-sm font-light tracking-wider [writing-mode:vertical-lr] uppercase">
                  {["t", "o", "p"].map((letter, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.08, delay: index * 0.07 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </h6>
              </>
            )}
          </button>
        </div>
      )}
    </AnimatePresence>
  );
}

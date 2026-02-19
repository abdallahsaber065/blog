"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const ReadingProgressBar = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past the hero (70vh ≈ 500px)
            setIsVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left"
            style={{
                scaleX,
                background: "linear-gradient(90deg, #E6A817, #F8CC4D, #FBD96A)",
                opacity: isVisible ? 1 : 0,
                transition: "opacity 0.3s ease",
            }}
        />
    );
};

export default ReadingProgressBar;

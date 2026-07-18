"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Shared entrance choreography: wrap sections in <Stagger>, items in <Rise>. */

const staggerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const riseVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const },
  },
};

export function Stagger(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerVariants}
      initial="hidden"
      animate="show"
      {...props}
    />
  );
}

export function Rise(props: HTMLMotionProps<"div">) {
  return <motion.div variants={riseVariants} {...props} />;
}

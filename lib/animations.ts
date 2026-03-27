import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: "easeIn" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
};

export const heroText: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } },
};

export const drawerVariants: Variants = {
  closed: { x: "100%", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  open: { x: "0%", transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } },
};

export const backdropVariants: Variants = {
  closed: { opacity: 0, transition: { duration: 0.3 } },
  open: { opacity: 1, transition: { duration: 0.3 } },
};

export const dropdownVariants: Variants = {
  closed: { opacity: 0, y: -8, scaleY: 0.95, transformOrigin: "top", transition: { duration: 0.15 } },
  open: { opacity: 1, y: 0, scaleY: 1, transformOrigin: "top", transition: { duration: 0.2, ease: "easeOut" } },
};

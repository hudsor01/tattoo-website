import { useRef } from 'react';
import { useInView } from 'framer-motion';

interface ScrollAnimationOptions {
  offset?: [string, string];
  smooth?: boolean;
  triggerOnce?: boolean;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { triggerOnce = true } = options;
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: triggerOnce,
    margin: "0px 0px -100px 0px"
  });
  
  return {
    ref,
    isInView,
  };
}
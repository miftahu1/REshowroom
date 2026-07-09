'use client';

import { useEffect, useState, useRef } from 'react';

interface StatCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
}

export default function StatCounter({ target, suffix = '', duration = 2000 }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          let startTime: number | null = null;
          
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [target, duration]);

  return (
    <div ref={elementRef} className="about-stat-num">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

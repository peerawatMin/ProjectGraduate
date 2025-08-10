// components/SmoothScrollControl.tsx
'use client';
import { useEffect } from 'react';

export default function SmoothScrollControl() {
  useEffect(() => {
    const container = document.getElementById('main-scroll');
    if (!container) return;

    let isScrolling = false;
    const sections = Array.from(container.querySelectorAll('section')) as HTMLElement[];
    let currentIndex = 0;

    const updateCurrentIndex = () => {
      const scrollPos = container.scrollTop;
      let newIndex = 0;
      sections.forEach((sec, idx) => {
        if (scrollPos >= sec.offsetTop - 50) {
          newIndex = idx;
        }
      });
      currentIndex = newIndex;
    };

    const scrollToSection = (index: number) => {
      if (index < 0 || index >= sections.length) return;
      isScrolling = true;
      sections[index]?.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        isScrolling = false;
        updateCurrentIndex();
      }, 4000); // เวลาเลื่อน 2 วิ
    };

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;
      e.preventDefault();
      updateCurrentIndex();

      const delta = e.deltaY;
      if (delta > 0 && currentIndex < sections.length - 1) {
        scrollToSection(currentIndex + 1);
      } else if (delta < 0 && currentIndex > 0) {
        scrollToSection(currentIndex - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;

      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        updateCurrentIndex();

        if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
          scrollToSection(currentIndex + 1);
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          scrollToSection(currentIndex - 1);
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown); // เพิ่มตรงนี้

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}

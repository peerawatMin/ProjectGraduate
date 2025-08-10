'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'intro', label: 'หน้าแรก' },
  { id: 'plan', label: 'แผนผัง' },
  { id: 'auto-assign', label: 'จัดที่นั่ง' },
  { id: 'visual', label: 'แผนผัง' },
  { id: 'export', label: 'ส่งออก' },
];

export default function DotNavigation() {
  const [activeId, setActiveId] = useState('intro');

  useEffect(() => {
    const container = document.querySelector('main');

    if (!container) return;

    const handleScroll = () => {
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerTop = container.getBoundingClientRect().top;
          const top = rect.top - containerTop;

          // ถ้า section นั้นอยู่กึ่งกลางหน้าจอของ container
          if (top >= 0 && top < window.innerHeight / 2) {
            setActiveId(section.id);
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-4 top-1/2 transform-translate-y-1/2 z-50 flex flex-col gap-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() =>
            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
          }
          className={`w-[5px] h-[5px] rounded-full transition-all duration-300 ${
            activeId === section.id ? 'bg-gray-700 scale-125' : 'bg-gray-300'
          }`}
          title={section.label}
        />
      ))}
    </div>
  );
}

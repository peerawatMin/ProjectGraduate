'use client';

import { motion } from 'framer-motion';

type SectionProps = {
  id: string;
  className: string;
  children: React.ReactNode;
};

export default function Section({ id, className, children }: SectionProps) {
  return (
    <section
    id={id}
    className={`h-screen w-full flex justify-center items-center px-6 ${className} snap-start`}
    >

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-center max-w-5xl w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

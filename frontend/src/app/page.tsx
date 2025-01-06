'use client';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen flex items-start justify-center pt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <h1 className="text-6xl font-bold text-[#3A4750] mb-4">
          Welcome to Pizza POS
        </h1>
        <p className="text-xl text-[#00ADB5]">
          Your Modern Pizza Management Solution
        </p>
        <p className="text-lg text-[#3A4750] mt-8">
          Click the menu options above to get started ↑
        </p>
      </motion.div>
    </main>
  );
}

import { motion } from 'motion/react'

export default function ExampleAnimation() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Example Animation</h2>
      <motion.div
        className="w-32 h-32 bg-blue-500 rounded-lg"
        initial={{ scale: 1, rotate: 0 }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

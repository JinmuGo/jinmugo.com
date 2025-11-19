import { AnimatePresence, motion } from "motion/react"
import { typography } from "@/utils/typography"

interface KeyboardHintsProps {
  show: boolean
}

export function KeyboardHints({ show }: KeyboardHintsProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg z-40"
        >
          <p className={`${typography.caption} text-gray-600 dark:text-gray-400 mb-3 font-medium`}>
            Keyboard shortcuts
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <kbd
                className={`${typography.captionSmall} px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono min-w-[28px] text-center`}
              >
                ←
              </kbd>
              <span className={`${typography.caption} text-gray-600 dark:text-gray-400`}>
                Previous
              </span>
            </div>
            <div className="flex items-center gap-3">
              <kbd
                className={`${typography.captionSmall} px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono min-w-[28px] text-center`}
              >
                →
              </kbd>
              <span className={`${typography.caption} text-gray-600 dark:text-gray-400`}>Next</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd
                className={`${typography.captionSmall} px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-mono min-w-[28px] text-center`}
              >
                ESC
              </kbd>
              <span className={`${typography.caption} text-gray-600 dark:text-gray-400`}>
                Close
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

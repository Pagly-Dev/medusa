import { clx } from "@medusajs/ui"
import { Transition, motion } from "motion/react"

type LogoBoxProps = {
  className?: string
  checked?: boolean
  containerTransition?: Transition
  pathTransition?: Transition
}

export const LogoBox = ({
  className,
  checked,
  containerTransition = {
    duration: 0.8,
    delay: 0.5,
    ease: [0, 0.71, 0.2, 1.01],
  },
  pathTransition = {
    duration: 0.8,
    delay: 0.6,
    ease: [0.1, 0.8, 0.2, 1.01],
  },
}: LogoBoxProps) => {
  return (
    <div
      className={clx(
        "bg-ui-button-neutral shadow-buttons-neutral relative flex size-14 items-center justify-center rounded-xl",
        "after:button-neutral-gradient after:inset-0 after:content-['']",
        className
      )}
    >
      {checked && (
        <motion.div
          className="absolute -right-[5px] -top-1 flex size-5 items-center justify-center rounded-full border-[0.5px] border-[rgba(3,7,18,0.2)] bg-[#3B82F6] bg-gradient-to-b from-white/0 to-white/20 shadow-[0px_1px_2px_0px_rgba(3,7,18,0.12),0px_1px_2px_0px_rgba(255,255,255,0.10)_inset,0px_-1px_5px_0px_rgba(255,255,255,0.10)_inset,0px_0px_0px_0px_rgba(3,7,18,0.06)_inset]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={containerTransition}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <motion.path
              d="M5.8335 10.4167L9.16683 13.75L14.1668 6.25"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={pathTransition}
            />
          </svg>
        </motion.div>
      )}
      <svg
        width="36"
        height="38"
        viewBox="0 0 36 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M171.29,104.64c-18.86,25.37-37.69,45.36-71.17,45.36-26.74-.01-48.67-21.03-49.95-47.52-1.45-27.48,20.45-51.45,47.95-52.45,28.52-1.11,52,21.69,52,49.96,0,7.9-1.83,15.37-5.1,22.01-1,2.03,1.57,3.92,3.18,2.34,7.91-7.76,15.17-17.27,22.79-27.76,2.44-3.35,3.42-7.58,2.6-11.64-6.97-34.21-37.21-59.95-73.48-59.95-41.31,0-75.01,33.47-75.01,75h0s0,162.09,0,162.09c0,6.88,5.39,12.79,12.27,12.91,7.01.13,12.74-5.52,12.74-12.5v-106.59c13.6,12.21,31.72,19.15,50,19.09,39.41,0,71.75-30.4,74.79-69.04.16-1.99-2.41-2.92-3.61-1.32Z"
          transform="translate(6 1) scale(0.12)"
          className="fill-ui-button-inverted relative drop-shadow-sm"
        />
      </svg>
    </div>
  )
}

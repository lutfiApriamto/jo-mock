import { useState } from 'react'
import { FaQuestionCircle } from 'react-icons/fa'

export default function InfoTooltip({ content, position = 'bottom' }) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        tabIndex={-1}
        className="w-5 h-5 flex items-center justify-center rounded-full
          text-muted-foreground/40 hover:text-muted-foreground/70
          transition-colors duration-150"
      >
        <FaQuestionCircle size={11} />
      </button>

      {visible && (
        <div className={[
          'absolute z-40 w-64 px-3.5 py-2.5 rounded-xl',
          'bg-background border border-border/80 shadow-xl',
          'text-[11.5px] text-muted-foreground leading-relaxed whitespace-normal',
          position === 'bottom'
            ? 'top-full mt-1.5 left-1/2 -translate-x-1/2'
            : 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
        ].join(' ')}>
          {content}
        </div>
      )}
    </div>
  )
}

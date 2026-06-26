'use client'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:     'bg-blue text-void hover:bg-blue/90',
        secondary:   'bg-card-hi text-snow border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)]',
        ghost:       'hover:bg-card-hi text-grey1 hover:text-snow',
        destructive: 'bg-orange/10 text-orange border border-orange/20 hover:bg-orange/20',
        success:     'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20',
        outline:     'border border-[rgba(255,255,255,0.08)] bg-transparent text-snow hover:bg-card-hi',
        link:        'text-blue underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-10 px-6',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }

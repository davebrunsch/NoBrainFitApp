import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-blue/12 text-blue border border-blue/20',
        secondary:   'bg-card-hi text-grey1 border border-[rgba(255,255,255,0.08)]',
        success:     'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
        warning:     'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
        destructive: 'bg-orange/10 text-orange border border-orange/20',
        lime:        'bg-lime/10 text-lime border border-lime/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

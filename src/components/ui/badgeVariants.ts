import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary/10 text-primary border border-primary/20',
        forest:
          'bg-primary text-primary-foreground border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground border border-border/80',
        gold:
          'bg-accent/15 text-[#9a6f23] border border-accent/30 font-semibold',
        outline:
          'text-foreground border border-border bg-card',
        success:
          'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
        warning:
          'bg-amber-50 text-amber-800 border border-amber-200/80',
        destructive:
          'bg-rose-50 text-rose-800 border border-rose-200/80',
        neutral:
          'bg-muted text-muted-foreground border border-border/60',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.2',
        default: 'text-xs px-2.5 py-0.5',
        md: 'text-xs px-3 py-1 font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

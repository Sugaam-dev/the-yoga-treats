import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-[#183f31] hover:shadow',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[#e7dfd3]',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-secondary/60 hover:border-foreground/20',
        ghost:
          'hover:bg-secondary/70 text-foreground',
        gold:
          'bg-accent text-accent-foreground hover:bg-[#a87a2a] shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        subtle:
          'bg-primary/10 text-primary hover:bg-primary/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base font-semibold',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-[#1e483c] hover:shadow',
        forest:
          'bg-[#193b32] text-white shadow-xs hover:bg-[#122b24] hover:shadow',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[#e2dcce] border border-border/40',
        outline:
          'border border-border bg-card/80 text-foreground hover:bg-secondary/70 hover:border-foreground/25 shadow-2xs',
        ghost:
          'hover:bg-secondary/70 text-foreground',
        gold:
          'bg-accent text-[#193b32] hover:bg-[#c7995f] font-semibold shadow-xs',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-[#b03729] shadow-xs',
        subtle:
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8.5 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-sm font-semibold',
        xl: 'h-12 rounded-xl px-7 text-base font-semibold',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

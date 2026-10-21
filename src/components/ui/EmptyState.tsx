import * as React from 'react'
import { Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-border/80 bg-card/60 backdrop-blur-xs',
        className
      )}
      {...props}
    >
      <div className="h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center text-primary mb-4 shadow-xs">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-lg font-medium text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}

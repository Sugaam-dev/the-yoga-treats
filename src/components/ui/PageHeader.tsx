import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = 'Back',
  badge,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-4 pb-6 border-b border-border/70 mb-6', className)}
      {...props}
    >
      {backHref && (
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>{backLabel}</span>
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

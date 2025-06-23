import React from 'react'
import { cn } from '@/lib/utils'

interface MainProps extends React.HTMLAttributes<HTMLElement> {}

export function Main({ className, children, ...props }: MainProps) {
  return (
    <main
      className={cn('flex-1', className)}
      {...props}
    >
      <div className="space-y-4 p-4 pt-20 sm:px-6">
        {children}
      </div>
    </main>
  )
}

Main.displayName = 'Main'

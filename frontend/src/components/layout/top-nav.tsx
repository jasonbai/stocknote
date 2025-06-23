import { Link } from '@tanstack/react-router'
import { IconMenu, IconExternalLink } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
    isExternal?: boolean
  }[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  return (
    <>
      <div className='md:hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='outline'>
              <IconMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {links.map(({ title, href, isActive, disabled, isExternal }) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                {isExternal ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex w-full items-center',
                      !isActive ? 'text-muted-foreground' : ''
                    )}
                  >
                    {title}
                    <IconExternalLink className="ml-1 h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    to={href}
                    className={!isActive ? 'text-muted-foreground' : ''}
                    disabled={disabled}
                  >
                    {title}
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn(
          'hidden items-center space-x-6 md:flex',
          className
        )}
        {...props}
      >
        {links.map(({ title, href, isActive, disabled, isExternal }) => (
          isExternal ? (
            <a
              key={`${title}-${href}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'hover:text-primary text-sm font-medium transition-colors flex items-center',
                isActive ? '' : 'text-muted-foreground'
              )}
            >
              {title}
              <IconExternalLink className="ml-1 h-4 w-4" />
            </a>
          ) : (
            <Link
              key={`${title}-${href}`}
              to={href}
              disabled={disabled}
              className={`hover:text-primary text-sm font-medium transition-colors ${isActive ? '' : 'text-muted-foreground'}`}
            >
              {title}
            </Link>
          )
        ))}
      </nav>
    </>
  )
}

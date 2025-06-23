import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-context'
import { Button } from './ui/button'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '', placeholder = '搜索...' }: Props) {
  const { setOpen } = useSearch()
  return (
    <Button
      variant='outline'
      className={cn(
        'bg-muted/25 text-muted-foreground hover:bg-muted/50 relative h-8 w-full justify-start rounded-md text-sm font-normal shadow-none sm:w-40 lg:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <IconSearch
        size={16}
        className='absolute left-2 top-1/2 -translate-y-1/2'
      />
      <span className='ml-7 truncate'>{placeholder}</span>
      <kbd className='bg-muted pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  )
}

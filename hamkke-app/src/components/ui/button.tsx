import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react'

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  href?: string
}

type ButtonProps = BaseProps &
  (
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  )

const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
const variantMap = {
  primary:   'bg-gray-900 text-white hover:bg-gray-700 focus-visible:ring-gray-900',
  secondary: 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500',
  ghost:     'bg-transparent border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400',
  danger:    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
}
const sizeMap = {
  sm: 'text-sm px-3 py-2 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, href, ...props }, ref) => {
    const classes = cn(base, variantMap[variant], sizeMap[size], className)

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {loading && <Spinner />}
          {children}
        </a>
      )
    }

    const { disabled, ...rest } = props as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <Spinner />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

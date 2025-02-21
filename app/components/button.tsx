import { cn } from "app/src/middleware"
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
  }
  
  export function Button({ children, className, variant = 'default', size = 'default', ...props }: ButtonProps) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          variant === 'default' ? "bg-primary text-primary-foreground hover:bg-primary/90" : undefined,
          variant === 'outline' ? "border border-input hover:bg-accent hover:text-accent-foreground" : undefined,
          variant === 'ghost' ? "hover:bg-accent hover:text-accent-foreground" : undefined,
          size === 'default' ? "h-10 py-2 px-4" : undefined,
          size === 'sm' ? "h-9 px-3 rounded-md" : undefined,
          size === 'lg' ? "h-11 px-8 rounded-md" : undefined,
          size === 'icon' ? "h-10 w-10" : undefined,
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
  
  export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
  
  export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'secondary' }) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variant === 'default' ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" : undefined,
          variant === 'secondary' ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" : undefined,
          className
        )}
      >
        {children}
      </span>
    )
  }
  
  export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    return (
      <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm ", className)} onClick={onClick}>
        {children}
      </div>
    )
  }
  
  export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
      <div className={cn("p-6", className)}>
        {children}
      </div>
    )
  }
  
  export function Switch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (checked: boolean) => void; className?: string }) {
    return (
      <button
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
        "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-input data-[state=unchecked]:bg-primary",
          className
        )}
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        />
      </button>
    )
  }
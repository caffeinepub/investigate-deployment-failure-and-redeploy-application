import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function VerifiedBadge({ size = 'medium', className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/assets/generated/blue-tick-badge-transparent.dim_24x24.png"
            alt="Verified Artist"
            className={`inline-block ${sizeClasses[size]} ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Artist / Pro User</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import {cn} from '@/lib/utils';
import logoSrc from './logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: 'size-10',
    img: 'size-8',
    text: 'text-lg',
  },
  md: {
    container: 'size-14',
    img: 'size-12',
    text: 'text-xl',
  },
  lg: {
    container: 'size-[220px]',
    img: 'size-[180px]',
    text: 'text-3xl',
  },
} as const;

export const Logo: React.FC<LogoProps> = ({
  size = 'sm',
  showText = true,
  className,
}) => {
  const config = SIZE_CONFIG[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          `
            flex items-center justify-center rounded-full bg-linear-to-br
            from-[oklch(0.75_0.22_125)] to-[oklch(0.65_0.20_135)]
          `,
          config.container,
        )}
      >
        <img
          src={logoSrc}
          alt="DreamFitness"
          className={cn('object-contain', config.img)}
        />
      </div>
      {showText && size !== 'lg' && (
        <span
          className={cn('font-bold text-[oklch(0.35_0.12_130)]', config.text)}
        >
          DreamFitness
        </span>
      )}
    </div>
  );
};

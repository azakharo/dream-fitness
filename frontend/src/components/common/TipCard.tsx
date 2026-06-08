import {cn} from '@/lib/utils';

interface TipCardProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
  className?: string;
}

export const TipCard: React.FC<TipCardProps> = ({
  title,
  text,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        `
          rounded-xl border
          border-[color-mix(in_oklch,oklch(0.68_0.22_130)_25%,transparent)]
          bg-linear-to-br from-[oklch(0.98_0.02_130)] to-[oklch(0.96_0.05_130)]
          p-5
          dark:border-[oklch(0.30_0.05_130)] dark:from-[oklch(0.20_0.02_130)]
          dark:to-[oklch(0.18_0.03_130)]
        `,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="
              flex size-10 shrink-0 items-center justify-center rounded-full
              bg-linear-to-br from-[oklch(0.75_0.22_125)]
              to-[oklch(0.65_0.20_135)]
            "
          >
            <span
              className="
                text-white
                [&_svg]:size-5
              "
            >
              {icon}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[oklch(0.35_0.12_130)]">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
};

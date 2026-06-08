import {cn} from '@/lib/utils';

interface MotivationBannerProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MotivationBanner: React.FC<MotivationBannerProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        `
          flex flex-col items-center gap-4 rounded-xl bg-linear-to-r
          from-[oklch(0.75_0.22_125)] to-[oklch(0.65_0.20_135)] p-6 text-center
          text-white
          md:flex-row md:text-left
        `,
        className,
      )}
    >
      {icon && (
        <div
          className="
            flex size-14 shrink-0 items-center justify-center rounded-full
            bg-white/20
          "
        >
          <span className="[&_svg]:size-7">{icon}</span>
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-white/90">{description}</p>
      </div>
    </div>
  );
};

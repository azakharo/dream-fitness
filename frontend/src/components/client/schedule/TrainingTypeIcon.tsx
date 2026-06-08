import {
  Dumbbell,
  Heart,
  Flame,
  Target,
  Sparkles,
  PersonStanding,
  Weight,
  Move,
} from 'lucide-react';
import type {TrainingType} from '@/types';

interface TrainingTypeIconProps {
  type: TrainingType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  sm: 'size-5',
  md: 'size-7',
  lg: 'size-9',
} as const;

const ICON_MAP: Record<
  TrainingType,
  React.ComponentType<{className?: string}>
> = {
  yoga: PersonStanding,
  crossfit: Dumbbell,
  boxing: Target,
  cardio: Flame,
  dance: Sparkles,
  pilates: Heart,
  strength: Weight,
  stretching: Move,
};

export const TrainingTypeIcon: React.FC<TrainingTypeIconProps> = ({
  type,
  size = 'md',
  className,
}) => {
  const IconComponent = ICON_MAP[type];
  const sizeClass = SIZE_CONFIG[size];

  return (
    <IconComponent
      className={`
        ${sizeClass}
        ${className ?? ''}
      `}
    />
  );
};

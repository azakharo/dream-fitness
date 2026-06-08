import * as React from 'react';

import {UpcomingBookings} from '@/components/client/history/UpcomingBookings';
import {PastTrainings} from '@/components/client/history/PastTrainings';
import {WaitlistPositions} from '@/components/client/history/WaitlistPositions';

type TabType = 'upcoming' | 'past' | 'waitlist';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('upcoming');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.15_0.02_130)]">
          История
        </h1>
        <p className="text-muted-foreground">Ваши тренировки и записи</p>
      </div>

      <div
        className="
          flex gap-2 border-b border-[oklch(0.90_0.01_130)]
          dark:border-[oklch(0.30_0.02_130)]
        "
      >
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`
            px-1 pb-2 text-sm font-medium transition-colors
            ${
              activeTab === 'upcoming'
                ? `
                  border-b-2 border-[oklch(0.68_0.22_130)]
                  text-[oklch(0.35_0.12_130)]
                `
                : `
                  text-muted-foreground
                  hover:text-[oklch(0.68_0.22_130)]
                `
            }
          `}
        >
          Предстоящие
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`
            px-1 pb-2 text-sm font-medium transition-colors
            ${
              activeTab === 'past'
                ? `
                  border-b-2 border-[oklch(0.68_0.22_130)]
                  text-[oklch(0.35_0.12_130)]
                `
                : `
                  text-muted-foreground
                  hover:text-[oklch(0.68_0.22_130)]
                `
            }
          `}
        >
          Прошедшие
        </button>
        <button
          onClick={() => setActiveTab('waitlist')}
          className={`
            px-1 pb-2 text-sm font-medium transition-colors
            ${
              activeTab === 'waitlist'
                ? `
                  border-b-2 border-[oklch(0.68_0.22_130)]
                  text-[oklch(0.35_0.12_130)]
                `
                : `
                  text-muted-foreground
                  hover:text-[oklch(0.68_0.22_130)]
                `
            }
          `}
        >
          Лист ожидания
        </button>
      </div>

      {activeTab === 'upcoming' && <UpcomingBookings />}
      {activeTab === 'past' && <PastTrainings />}
      {activeTab === 'waitlist' && <WaitlistPositions />}
    </div>
  );
};

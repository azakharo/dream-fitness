import * as React from 'react';

import {UpcomingBookings} from '@/components/client/history/UpcomingBookings';
import {PastTrainings} from '@/components/client/history/PastTrainings';
import {WaitlistPositions} from '@/components/client/history/WaitlistPositions';

type TabType = 'upcoming' | 'past' | 'waitlist';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('upcoming');

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">История</h1>

      <div className="mb-4 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`
            px-1 pb-2 text-sm font-medium transition-colors
            ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-primary text-primary'
                : `
                  text-muted-foreground
                  hover:text-foreground
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
                ? 'border-b-2 border-primary text-primary'
                : `
                  text-muted-foreground
                  hover:text-foreground
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
                ? 'border-b-2 border-primary text-primary'
                : `
                  text-muted-foreground
                  hover:text-foreground
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

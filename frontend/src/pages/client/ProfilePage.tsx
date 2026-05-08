import {useState} from 'react';
import {ProfileInfo} from '@/components/client/profile/ProfileInfo';
import {EditProfileForm} from '@/components/client/profile/EditProfileForm';
import {TopUpBalance} from '@/components/client/profile/TopUpBalance';
import {useAuthStore} from '@/stores/auth-store';
import {useBalance} from '@/hooks/use-balance';

export const ProfilePage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const {user, isLoading: isUserLoading} = useAuthStore();
  const {data: balanceData, isLoading: isBalanceLoading} = useBalance();

  const isLoading = isUserLoading || isBalanceLoading;
  const balance = balanceData?.balance ?? 0;

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
  };

  const handleTopUp = () => {
    setIsTopUpOpen(true);
  };

  const handleTopUpSuccess = () => {
    setIsTopUpOpen(false);
  };

  if (!user && !isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Профиль</h1>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-muted-foreground">Управление личными данными</p>
      </div>

      <div className="max-w-md">
        {isEditMode && user ? (
          <EditProfileForm
            user={user}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        ) : (
          user && (
            <ProfileInfo
              user={user}
              onEdit={handleEdit}
              onTopUp={handleTopUp}
              isLoading={isLoading}
            />
          )
        )}
      </div>

      {isTopUpOpen && (
        <div className="max-w-md">
          <TopUpBalance
            currentBalance={balance}
            onSuccess={handleTopUpSuccess}
          />
        </div>
      )}
    </div>
  );
};

import {useParams} from '@tanstack/react-router';

export const AdminScheduleEditPage: React.FC = () => {
  const {id} = useParams({from: '/admin/schedule/$id'});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Редактирование тренировки</h1>
      <p className="text-muted-foreground">ID тренировки: {id}</p>
    </div>
  );
};

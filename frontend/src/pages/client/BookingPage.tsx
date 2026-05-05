import {useParams} from '@tanstack/react-router';

export const BookingPage: React.FC = () => {
  const {id} = useParams({from: '/_client/booking/$id'});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Бронирование тренировки</h1>
      <p className="text-muted-foreground">ID тренировки: {id}</p>
    </div>
  );
};

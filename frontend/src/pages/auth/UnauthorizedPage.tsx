import {Link} from '@tanstack/react-router';
import {Button} from '@/components/ui/button';

export const UnauthorizedPage = () => {
  return (
    <div
      className="
        flex min-h-screen flex-col items-center justify-center bg-background
      "
    >
      <h1 className="text-4xl font-bold">Доступ запрещён</h1>
      <p className="mt-4 text-muted-foreground">
        У вас нет прав для просмотра этой страницы.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Вернуться на главную</Link>
      </Button>
    </div>
  );
};

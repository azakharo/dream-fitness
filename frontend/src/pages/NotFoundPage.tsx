import {Link} from '@tanstack/react-router';
import {Button} from '@/components/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-muted-foreground">
            404
          </CardTitle>
          <CardDescription className="mt-2 text-2xl font-semibold">
            Страница не найдена
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Извините, запрашиваемая страница не существует или была перемещена.
          </p>
          <Button asChild>
            <Link to="/">Вернуться на главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

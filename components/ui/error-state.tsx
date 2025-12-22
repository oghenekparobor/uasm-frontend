import { ErrorStateProps } from '@/types/api';
import { Button } from './button';

export function ErrorState({ title = 'Error', message, retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h3 className="text-lg font-semibold mb-2 text-red-600">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}


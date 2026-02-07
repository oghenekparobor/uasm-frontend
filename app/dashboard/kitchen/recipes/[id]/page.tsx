'use client';

import { useParams, useRouter } from 'next/navigation';
import { kitchenApi } from '@/lib/api-services';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { formatDate } from '@/lib/utils/date';

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: recipe, loading, error, refetch } = useApi(() =>
    kitchenApi.getRecipe(id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} retry={refetch} />;
  }

  if (!recipe) {
    return <ErrorState message="Recipe not found" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
          {recipe.category && (
            <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
              {recipe.category}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Recipe Name</p>
              <p className="font-semibold">{recipe.name}</p>
            </div>
            {recipe.category && (
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold">{recipe.category}</p>
              </div>
            )}
            {recipe.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-semibold whitespace-pre-wrap">
                  {recipe.description}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold">
                {formatDate(recipe.createdAt)}
              </p>
            </div>
            {recipe.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-semibold">
                  {formatDate(recipe.updatedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingredients */}
        {recipe.ingredients && (
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {recipe.ingredients}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {recipe.instructions && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {recipe.instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Portion Sizes */}
        {recipe.portionSizes && (
          <Card>
            <CardHeader>
              <CardTitle>Portion Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {recipe.portionSizes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Nutritional Information */}
        {recipe.nutritionalInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {recipe.nutritionalInfo}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Production Logs */}
      {recipe.productionLogs && recipe.productionLogs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Production Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipe.productionLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">Quantity: {log.quantity}</p>
                    <p className="text-sm text-gray-500">
                      Week: {formatDate(log.weekDate)}
                    </p>
                    {log.user && (
                      <p className="text-xs text-gray-400 mt-1">
                        Logged by: {log.user.firstName} {log.user.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { kitchenApi } from '@/lib/api-services';
import { usePaginatedApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import {
  CreateRecipeForm,
  LogProductionForm,
} from '@/components/forms/kitchen-form';

export default function KitchenPage() {
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const {
    data: recipes,
    loading: recipesLoading,
    error: recipesError,
    refetch: refetchRecipes,
  } = usePaginatedApi(kitchenApi.getRecipes, { page: 1, limit: 10 });
  const {
    data: production,
    loading: productionLoading,
    error: productionError,
    refetch: refetchProduction,
  } = usePaginatedApi(kitchenApi.getProduction, { page: 1, limit: 10 });

  const loading = recipesLoading || productionLoading;
  const error = recipesError || productionError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Kitchen</h1>
          <p className="text-gray-600">
            Manage recipes and production logs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsProductionModalOpen(true)}
          >
            Log Production
          </Button>
          <Button onClick={() => setIsRecipeModalOpen(true)}>Add Recipe</Button>
        </div>
      </div>

      {/* Recipes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {!recipes || recipes.length === 0 ? (
            <p className="text-gray-500">No recipes found.</p>
          ) : (
            <div className="space-y-4">
              {recipes.map((recipe: any) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-gray-500">
                      {recipe.description}
                    </p>
                  </div>
                  <Button variant="outline">View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Production Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {!production || production.length === 0 ? (
            <p className="text-gray-500">No production logs found.</p>
          ) : (
            <div className="space-y-4">
              {production.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{log.recipe?.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {log.quantity} | Week:{' '}
                      {new Date(log.weekDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Recipe Modal */}
      <Modal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        title="Add Recipe"
        size="md"
      >
        <CreateRecipeForm
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          onSuccess={() => {
            refetchRecipes();
            setIsRecipeModalOpen(false);
          }}
        />
      </Modal>

      {/* Log Production Modal */}
      <Modal
        isOpen={isProductionModalOpen}
        onClose={() => setIsProductionModalOpen(false)}
        title="Log Production"
        size="md"
      >
        <LogProductionForm
          isOpen={isProductionModalOpen}
          onClose={() => setIsProductionModalOpen(false)}
          onSuccess={() => {
            refetchProduction();
            setIsProductionModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

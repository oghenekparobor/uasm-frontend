'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createRecipeSchema,
  logProductionSchema,
  type CreateRecipeInput,
  type LogProductionInput,
} from '@/lib/validations/kitchen.schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { kitchenApi } from '@/lib/api-services';
import { toast } from '@/hooks/use-toast';

interface CreateRecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function CreateRecipeForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateRecipeFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateRecipeInput>({
    resolver: zodResolver(createRecipeSchema),
    mode: 'onChange', // Real-time validation
  });

  useEffect(() => {
    if (isOpen && initialData) {
      Object.keys(initialData).forEach((key) => {
        setValue(key as any, initialData[key]);
      });
    } else {
      reset();
    }
  }, [isOpen, initialData, reset, setValue]);

  const onSubmit = async (data: CreateRecipeInput) => {
    try {
      setLoading(true);
      if (initialData) {
        // Update recipe (if update endpoint exists)
        toast.info('Update functionality coming soon');
      } else {
        await kitchenApi.createRecipe(data);
        toast.success('Recipe created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Recipe Name"
        {...register('name')}
        error={errors.name?.message}
      />

      <Input
        label="Category"
        {...register('category')}
        error={errors.category?.message}
        placeholder="e.g., Breakfast, Lunch, Dinner, Snack"
      />

      <Textarea
        label="Description"
        rows={3}
        {...register('description')}
        error={errors.description?.message}
      />

      <Textarea
        label="Ingredients"
        rows={5}
        {...register('ingredients')}
        error={errors.ingredients?.message}
        placeholder="List ingredients, one per line or separated by commas"
      />

      <Textarea
        label="Instructions"
        rows={8}
        {...register('instructions')}
        error={errors.instructions?.message}
        placeholder="Step-by-step cooking instructions"
      />

      <Textarea
        label="Portion Sizes"
        rows={3}
        {...register('portionSizes')}
        error={errors.portionSizes?.message}
        placeholder="e.g., Serves 20, 1 cup per serving"
      />

      <Textarea
        label="Nutritional Information"
        rows={4}
        {...register('nutritionalInfo')}
        error={errors.nutritionalInfo?.message}
        placeholder="Calories, protein, carbs, etc. (optional)"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

interface LogProductionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogProductionForm({
  isOpen,
  onClose,
  onSuccess,
}: LogProductionFormProps) {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LogProductionInput>({
    resolver: zodResolver(logProductionSchema),
    mode: 'onChange', // Real-time validation
  });

  useEffect(() => {
    if (isOpen) {
      const fetchRecipes = async () => {
        try {
          const response = await kitchenApi.getRecipes({ limit: 100 });
          setRecipes(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch recipes:', error);
        }
      };
      fetchRecipes();
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: LogProductionInput) => {
    try {
      setLoading(true);
      await kitchenApi.logProduction(data);
      toast.success('Production logged successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to log production');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Recipe"
        {...register('recipeId')}
        error={errors.recipeId?.message}
        options={[
          { value: '', label: 'Select recipe' },
          ...recipes.map((recipe) => ({
            value: recipe.id,
            label: recipe.name,
          })),
        ]}
      />

      <Input
        label="Quantity"
        type="number"
        {...register('quantity', { valueAsNumber: true })}
        error={errors.quantity?.message}
      />

      <Input
        label="Week Date"
        type="date"
        {...register('weekDate')}
        error={errors.weekDate?.message}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging...' : 'Log Production'}
        </Button>
      </div>
    </form>
  );
}


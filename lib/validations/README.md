# Form Validation Documentation

## Overview

The frontend uses Zod schemas for form validation, providing type-safe validation that matches backend DTOs. All forms use React Hook Form with Zod resolver for seamless validation.

## Validation Schemas

All validation schemas are located in `lib/validations/`:

- `member.schema.ts` - Member creation/update validation
- `user.schema.ts` - User creation/update and role assignment
- `class.schema.ts` - Class creation/update and leader assignment
- `attendance.schema.ts` - Attendance window and submission
- `distribution.schema.ts` - Distribution batch and allocation
- `kitchen.schema.ts` - Recipe and production log
- `empowerment.schema.ts` - Empowerment request creation and approval
- `event.schema.ts` - Event creation
- `request.schema.ts` - General request creation

## Usage

### Basic Form with Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema } from '@/lib/validations/member.schema';

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createMemberSchema),
    mode: 'onChange', // Real-time validation
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('firstName')}
        error={errors.firstName?.message}
      />
    </form>
  );
}
```

### Using the Validation Hook

```tsx
import { useFormValidation } from '@/hooks/use-form-validation';
import { createMemberSchema } from '@/lib/validations/member.schema';

function MyForm() {
  const {
    validateField,
    setFieldTouched,
    getFieldHasError,
    errors,
  } = useFormValidation(createMemberSchema);

  return (
    <Input
      {...register('firstName', {
        onBlur: () => setFieldTouched('firstName'),
      })}
      error={errors.firstName}
      className={getFieldHasError('firstName') ? 'border-red-500' : ''}
    />
  );
}
```

## Real-Time Validation

Forms are configured with `mode: 'onChange'` to provide real-time validation feedback:

- **onChange**: Validates on every change (real-time)
- **onBlur**: Validates when field loses focus
- **onSubmit**: Validates only on form submission

## Error Display

Errors are displayed using the `error` prop on form components:

```tsx
<Input
  {...register('email')}
  error={errors.email?.message}
/>
```

The error message comes directly from the Zod schema validation.

## Validation Features

### Required Fields
```typescript
z.string().min(1, 'This field is required')
```

### Email Validation
```typescript
z.string().email('Invalid email address')
```

### UUID Validation
```typescript
z.string().uuid('Invalid ID format')
```

### Number Validation
```typescript
z.number().int().positive('Must be a positive number')
```

### Custom Validation
```typescript
z.string().refine(
  (val) => val.length >= 8,
  { message: 'Must be at least 8 characters' }
)
```

## Best Practices

1. **Match Backend DTOs**: Validation schemas should match backend DTOs exactly
2. **Clear Error Messages**: Provide user-friendly error messages
3. **Real-Time Feedback**: Use `onChange` mode for better UX
4. **Field-Level Validation**: Validate individual fields on blur
5. **Form-Level Validation**: Validate entire form on submit

## Common Patterns

### Optional Fields
```typescript
z.string().optional().or(z.literal(''))
```

### Conditional Validation
```typescript
z.object({
  type: z.enum(['A', 'B']),
  value: z.string().optional(),
}).refine(
  (data) => data.type === 'A' ? !!data.value : true,
  { message: 'Value required for type A', path: ['value'] }
)
```

### Date Validation
```typescript
z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
)
```

## Testing Validation

To test validation schemas:

```typescript
import { createMemberSchema } from '@/lib/validations/member.schema';

// Valid data
const valid = createMemberSchema.parse({
  firstName: 'John',
  lastName: 'Doe',
  currentClassId: 'uuid-here',
});

// Invalid data (throws ZodError)
try {
  createMemberSchema.parse({ firstName: '' });
} catch (error) {
  console.error(error.errors);
}
```


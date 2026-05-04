import * as React from 'react';
import {
  Controller,
  FormProvider as RHFProvider,
  useFormContext,
} from 'react-hook-form';
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

// Context for field state (name, error, etc.)
const FormFieldContext = React.createContext<{
  name: string;
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error?: {message?: string};
}>({name: '', invalid: false, isDirty: false, isTouched: false});

// Context for form item ID
const FormItemContext = React.createContext<{id: string}>({id: ''});

// Hook to access field state from context
export const useFormField = () => {
  const fieldContext = React.use(FormFieldContext);
  const itemContext = React.use(FormItemContext);
  const {getFieldState, formState} = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  return {
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    ...fieldState,
  };
};

// Form Provider wrapper
interface FormProviderProps<TFieldValues extends FieldValues = FieldValues> {
  children: React.ReactNode;
  form: UseFormReturn<TFieldValues>;
}

export function FormProvider<TFieldValues extends FieldValues = FieldValues>({
  children,
  form,
}: FormProviderProps<TFieldValues>) {
  return <RHFProvider {...form}>{children}</RHFProvider>;
}

// Form Field - wraps Controller with context
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <Controller
      {...props}
      render={({field, fieldState, formState}) => (
        <FormFieldContext
          value={{
            name: props.name,
            invalid: fieldState.invalid,
            isDirty: fieldState.isDirty,
            isTouched: fieldState.isTouched,
            error: fieldState.error,
          }}
        >
          {props.render({field, fieldState, formState})}
        </FormFieldContext>
      )}
    />
  );
}

// Form Item - provides ID context
export const FormItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const id = React.useId();

  return (
    <FormItemContext value={{id}}>
      <div data-slot="form-item" className={className} {...props} />
    </FormItemContext>
  );
};

FormItem.displayName = 'FormItem';

// Form Label
export const FormLabel: React.FC<
  React.LabelHTMLAttributes<HTMLLabelElement>
> = ({className, ...props}) => {
  const {formItemId, error} = useFormField();

  return (
    <label
      data-slot="form-label"
      data-error={!!error}
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  );
};

FormLabel.displayName = 'FormLabel';

// Form Control
export const FormControl: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const {error, formDescriptionId, formMessageId} = useFormField();

  return (
    <div
      data-slot="form-control"
      data-error={!!error}
      className={className}
      aria-invalid={!!error}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-errormessage={error ? formMessageId : undefined}
      {...props}
    />
  );
};

FormControl.displayName = 'FormControl';

// Form Description
export const FormDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({className, ...props}) => {
  const {formDescriptionId} = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={className}
      {...props}
    />
  );
};

FormDescription.displayName = 'FormDescription';

// Form Message - displays validation errors
export const FormMessage: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({className, children, ...props}) => {
  const {error, formMessageId} = useFormField();
  const body = error ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={className}
      {...props}
    >
      {body}
    </p>
  );
};

FormMessage.displayName = 'FormMessage';

// Form wrapper
interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFieldValues>;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  className,
  children,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <RHFProvider {...form}>
      <form data-slot="form" className={className} {...props}>
        {children}
      </form>
    </RHFProvider>
  );
}

Form.displayName = 'Form';

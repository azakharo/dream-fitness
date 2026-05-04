import * as React from 'react';
import {Controller, FormProvider as RHFProvider} from 'react-hook-form';
import type {ControllerProps, UseFormReturn} from 'react-hook-form';

// Form Provider wrapper
interface FormProviderProps<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
> {
  children: React.ReactNode;
  form: UseFormReturn<TFieldValues>;
}

export function FormProvider<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
>({children, form}: FormProviderProps<TFieldValues>) {
  return <RHFProvider {...form}>{children}</RHFProvider>;
}

// Form Field
export function FormField(props: ControllerProps): React.ReactElement {
  return (<Controller {...props} />) as unknown as React.ReactElement;
}

// Form Item
export const FormItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div data-slot="form-item" className={className} {...props} />;
};

FormItem.displayName = 'FormItem';

// Form Label
export const FormLabel: React.FC<
  React.LabelHTMLAttributes<HTMLLabelElement>
> = ({className, ...props}) => {
  return <label className={className} {...props} />;
};

FormLabel.displayName = 'FormLabel';

// Form Control
export const FormControl: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div data-slot="form-control" className={className} {...props} />;
};

FormControl.displayName = 'FormControl';

// Form Message
export const FormMessage: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({className, children, ...props}) => {
  return (
    <p data-slot="form-message" className={className} {...props}>
      {children}
    </p>
  );
};

FormMessage.displayName = 'FormMessage';

// Form wrapper
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export const Form: React.FC<FormProps> = ({className, ...props}) => {
  return <form data-slot="form" className={className} {...props} />;
};

Form.displayName = 'Form';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function TextField({
  label,
  error,
  hint,
  prefix,
  suffix,
  className,
  id,
  disabled,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-body font-medium text-ink">{label}</span>
      <span
        className={cn(
          'flex h-14 items-center rounded-input bg-surface px-3 ring-1 ring-transparent transition',
          'focus-within:ring-2 focus-within:ring-forest-800/30',
          error && 'ring-2 ring-danger/70 focus-within:ring-danger/70',
          disabled && 'opacity-50',
        )}
      >
        {prefix ? <span className="mr-2 shrink-0">{prefix}</span> : null}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-muted',
            className,
          )}
          {...props}
        />
        {suffix ? <span className="ml-2 shrink-0">{suffix}</span> : null}
      </span>
      {error ? (
        <span id={errorId} className="mt-1.5 block text-caption text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-caption text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

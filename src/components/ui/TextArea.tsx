import { useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, className, id, rows = 3, ...props }: TextAreaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-body font-medium text-ink">{label}</span>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full resize-none rounded-input bg-surface px-4 py-3 text-body text-ink outline-none',
          'placeholder:text-muted focus-visible:ring-2 focus-visible:ring-forest-800/30',
          error && 'ring-2 ring-danger/70 focus-visible:ring-danger/70',
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={errorId} className="mt-1.5 block text-caption text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

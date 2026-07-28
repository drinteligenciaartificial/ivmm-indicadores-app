"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  className = "button",
  pendingLabel = "Carregando...",
  disabled,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type={type} disabled={disabled || pending} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <span className="button-spinner" aria-hidden="true" />
          <span>{pendingLabel}</span>
        </>
      ) : children}
    </button>
  );
}

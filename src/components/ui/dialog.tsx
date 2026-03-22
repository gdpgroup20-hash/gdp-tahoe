"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ children }: DialogProps) {
  return <>{children}</>
}

function DialogTrigger({
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}

function DialogContent({
  className,
  children,
  open,
  onClose,
}: {
  className?: string
  children: React.ReactNode
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg",
            className
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}

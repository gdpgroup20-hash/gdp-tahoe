"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  setOpen: () => {},
})

function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(SheetContext)
  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function SheetContent({
  children,
  className,
  side = "right",
}: {
  children: React.ReactNode
  className?: string
  side?: "left" | "right" | "top" | "bottom"
}) {
  const { open, setOpen } = React.useContext(SheetContext)

  if (!open) return null

  const sideClasses = {
    right: "inset-y-0 right-0 w-3/4 max-w-sm border-l",
    left: "inset-y-0 left-0 w-3/4 max-w-sm border-r",
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "fixed z-50 bg-background p-6 shadow-lg",
          sideClasses[side],
          className
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-2", className)} {...props} />
  )
}

function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function SheetClose({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(SheetContext)
  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}

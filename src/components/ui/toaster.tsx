
import { useToast, toast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Copy } from "lucide-react"
import React from "react"

export function Toaster() {
  const { toasts } = useToast()

  const handleCopy = (text: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: "Текст скопирован в буфер обмена.",
      })
    }, () => {
      const errorCode = 'TOASTER-001';
      const errorText = "Не удалось скопировать текст.";
      toast({
        variant: "destructive",
        title: `Ошибка [${errorCode}]`,
        description: errorText,
      })
    })
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, copyableText, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {copyableText && (
              <button
                onClick={(e) => handleCopy(copyableText, e)}
                className="absolute right-10 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

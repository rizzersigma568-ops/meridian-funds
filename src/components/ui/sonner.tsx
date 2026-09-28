import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="light"
      className="toaster"
      toastOptions={{
        classNames: {
          toast: "bg-surface text-fg border-border",
        },
      }}
    />
  );
}

export { Toaster };

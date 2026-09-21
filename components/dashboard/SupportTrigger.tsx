'use client';

/**
 * SupportTrigger — shared utility for showing the support modal
 * with a pre-filled error context message.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SupportModal } from './SupportModal';

interface SupportTriggerContext {
  openSupport: (errorContext?: string) => void;
}

const Ctx = createContext<SupportTriggerContext>({ openSupport: () => {} });

export function SupportTriggerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [errorContext, setErrorContext] = useState<string | undefined>();

  const openSupport = useCallback((ctx?: string) => {
    setErrorContext(ctx);
    setOpen(true);
  }, []);

  return (
    <Ctx.Provider value={{ openSupport }}>
      {children}
      <SupportModal open={open} onOpenChange={setOpen} initialMessage={errorContext} />
    </Ctx.Provider>
  );
}

export function useSupportTrigger() {
  return useContext(Ctx);
}

"use client";
import { useEffect } from 'react';

export default function BootstrapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Import Bootstrap JS dynamically
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return <>{children}</>;
} 
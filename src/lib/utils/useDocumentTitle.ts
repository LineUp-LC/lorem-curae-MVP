import { useEffect } from 'react';

export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Lorem Curae`;
    }
    return () => { document.title = 'Lorem Curae'; };
  }, [title]);
}

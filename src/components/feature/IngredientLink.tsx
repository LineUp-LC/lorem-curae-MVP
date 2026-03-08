import { Link } from 'react-router-dom';
import { getIngredientSlug } from '../../lib/utils/ingredientProducts';
import type { ReactNode } from 'react';

interface IngredientLinkProps {
  name: string;
  className?: string;
  children?: ReactNode;
}

export default function IngredientLink({ name, className, children }: IngredientLinkProps) {
  const slug = getIngredientSlug(name);

  if (!slug) {
    return <span className={className}>{children ?? name}</span>;
  }

  return (
    <Link
      to={`/ingredients?id=${slug}`}
      className={`underline decoration-dotted underline-offset-2 hover:text-primary transition-colors ${className ?? ''}`}
      aria-label={`View ingredient details for ${name}`}
    >
      {children ?? name}
    </Link>
  );
}

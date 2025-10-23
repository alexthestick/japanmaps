import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg shadow-md p-4',
        hoverable && 'cursor-pointer hover:shadow-lg transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}



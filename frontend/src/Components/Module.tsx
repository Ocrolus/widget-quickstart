import { PropsWithChildren } from 'react';
import { Card } from '@mui/material';

interface ModuleProps extends PropsWithChildren {
  className?: string;
}

export default function Module({ children, className }: ModuleProps) {
  return (
    <Card className={className} sx={{ padding: '15px' }}>
      {children}
    </Card>
  );
}

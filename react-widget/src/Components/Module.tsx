import { PropsWithChildren } from 'react'
import { Card } from '@mui/material'

interface StylableProps {
    id?: string
    className?: string
}

export default function Module({ children, id, className }: PropsWithChildren<StylableProps>) {
    return (
        <Card id={id} className={className} sx={{ padding: '15px' }}>
            {children}
        </Card>
    )
}

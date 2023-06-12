import { PropsWithChildren } from 'react'
import { Card } from '@mui/material'

export default function Module({ children }: PropsWithChildren) {
    return <Card sx={{padding: '15px'}}>{children}</Card>
}
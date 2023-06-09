import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import Sidebar from 'Components/Sidebar'
import IncomePrompt from 'Components/IncomePrompt'
import './App.css'
import Module from 'Components/Module'

function App() {
    useEffect(() => {(window as any).getAuthToken = async function() {
        const response = await fetch("https://auth.ocrolusexample.com/token", { method: "POST"})
        const json = await response.json()
        return json.accessToken
    }}, [])
    
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" className='content-column' sx={{ flexGrow: 1, p: 3 }}>
                <IncomePrompt />
                <Module>
                    <Box id="ocrolus-widget-frame"></Box>
                </Module> 
            </Box>
        </Box>
    )
}

export default App

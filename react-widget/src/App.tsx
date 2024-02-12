import { useState, useEffect, useCallback } from 'react' // Import React first
import { Box, Button, CircularProgress } from '@mui/material'
import Sidebar from 'Components/Sidebar'
import IncomePrompt from 'Components/IncomePrompt'
import './App.css'
import Module from 'Components/Module'
import { useWidget, OcrolusUploadTypes, OcrolusUpload } from 'ocrolus-react-widget'

function App() {
    const buttonStyle = {
        maxWidth: '280px',
        height: 50,
        color: 'white',
        borderRadius: '3px',
        backgroundColor: 'blue',
        border: 0,
        mt: 3,
        fontWeight: 500,
        cursor: 'pointer',
        '&:hover': {
            color: 'white',
            backgroundColor: 'rgb(71, 89, 226)',
        },
    }

    const [options, setOptions] = useState<OcrolusUploadTypes['OcrolusUploadOptions']>({
        widgetUuid: 'bbdd9bd6-ad86-480f-b0d0-551d1cc0d9ff',
    })

    const fetchToken = useCallback(
        async () => {
            const response = await fetch('https://auth.ocrolusexample.com/token', { method: 'POST' })
            const json = await response.json()

            setOptions((prevOpts: OcrolusUploadTypes['OcrolusUploadOptions']) => ({ ...prevOpts, token: json.accessToken }))
        },
        [setOptions]
    )
    useEffect(() => {
        fetchToken()
    }, [fetchToken])

    const { ready, open } = useWidget(options)

    const moduleProps = { display: 'flex', flexDirection: 'column', alignItems: 'center' }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" className="content-column" sx={{ flexGrow: 1, p: 3 }}>
                <IncomePrompt />
                <br />
                <Module className="ocrolus-widget">
                    <Box sx={moduleProps}>
                        <Box sx={{ marginBottom: '20px' }}> Widget Hook </Box>
                        <Box>
                            {ready ? (
                                <Button onClick={open} sx={buttonStyle}>
                                    Launch Widget Hook Modal
                                </Button>
                            ) : (
                                <CircularProgress />
                            )}
                        </Box>
                    </Box>
                    <Box sx={moduleProps}>
                        <Box sx={{ marginBottom: '20px' }}> Widget Component</Box>
                        <OcrolusUpload {...options} loadingElement={() => <CircularProgress />}>
                            <Button sx={buttonStyle}>Launch Widget Component Modal</Button>
                        </OcrolusUpload>
                    </Box>
                </Module>
            </Box>
        </Box>
    )
}

export default App

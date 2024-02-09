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
            backgroundColor: 'primary.main',
        },
    }

    const [options, setOptions] = useState<OcrolusUploadTypes['OcrolusUploadOptions']>({
        widgetUuid: '0e522c18-ea76-4402-8959-0dd6e6fcfebc',
    })

    const fetchToken = useCallback(
        async (widgetUuid: string) => {
            const body = {
                grant_type: 'client_credentials',
                client_id: 'VbvkrO6chFz8IbYcoFtnomAKGaQDlvLM',
                client_secret: 'nIKMLnKKQZEE1fAkde8AQwMr2BYhr6ZKA7_zT2DhC4X5bEGJlt3SJELl5Bn_nbex',
                external_id: '8884848',
                custom_id: 'whatever',
            }
            const response = await fetch(`https://widget-demo.ocrolus.com/v1/widget/${widgetUuid}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            const json = await response.json()
            //@ts-ignore
            setOptions(prevOpts => ({ ...prevOpts, token: json.access_token }))
        },
        [setOptions]
    )
    useEffect(() => {
        fetchToken(options.widgetUuid)
    }, [options, fetchToken])

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
                        <OcrolusUpload {...options} loadingElement={<CircularProgress />}>
                            <Button sx={buttonStyle}>Launch Widget Component Modal</Button>
                        </OcrolusUpload>
                    </Box>
                </Module>
            </Box>
        </Box>
    )
}

export default App

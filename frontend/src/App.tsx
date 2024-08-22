import { useEffect, useState } from 'react'
import { Box, Input, Button } from '@mui/material'
import Sidebar from 'Components/Sidebar'
import IncomePrompt from 'Components/IncomePrompt'
import './App.css'
import Module from 'Components/Module'

function App() {
    const [userKey, setUserKey] = useState('')
    const [bookName, setFolderName] = useState('')
    const [submit, setSubmit] = useState(false)
    useEffect(() => {
        if (submit) {
            ;(window as any).getAuthToken = async function () {
                const response = await fetch('https://auth.ocrolusexample.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userKey,
                        bookName: bookName,
                    }),
                })
                const json = await response.json()
                return json.accessToken
            }
        }
    }, [userKey, bookName, submit])

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" className="content-column" sx={{ flexGrow: 1, p: 3 }}>
                <IncomePrompt />
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Input
                        style={{ marginRight: '15px' }}
                        type="text"
                        placeholder="Enter User Key"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserKey(e.target.value)}
                    />
                    {userKey && (
                        <Input
                            style={{ marginRight: '15px' }}
                            type="text"
                            placeholder="Enter Book Name"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFolderName(e.target.value)
                            }
                        />
                    )}
                    <Button onClick={() => setSubmit(!submit)}>Get Token</Button>
                </Box>
                <Module>
                    <Box id="ocrolus-widget-frame"></Box>
                </Module>
            </Box>
        </Box>
    )
}

export default App

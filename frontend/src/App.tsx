import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import './App.css';

// Professional dark theme with accent color
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d', // Deep navy blue
      light: '#2d4a7c',
      dark: '#0f2744',
    },
    secondary: {
      main: '#38a169', // Success green
      light: '#68d391',
      dark: '#276749',
    },
    background: {
      default: '#f7fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Widget event types
interface WidgetEvent {
  type: string;
  uploads?: Array<{ name: string; size: number; type: string; bookUuid?: string; message?: string }>;
  uploadedFileCount?: number;
  error?: {
    errorType: string;
    errorCode: string;
    displayMessage: string;
  };
}

const steps = ['Business Information', 'Financial Documents', 'Review & Submit'];

function App() {
  const [activeStep] = useState(1); // Start on Financial Documents step
  const [widgetReady, setWidgetReady] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [uploadStats, setUploadStats] = useState({ received: 0, completed: 0, failed: 0 });
  const [bankConnected, setBankConnected] = useState(false);

  // Set up getAuthToken for the widget
  useEffect(() => {
    (window as any).getAuthToken = async function () {
      const response = await fetch('https://auth.ocrolusexample.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `user-${Date.now()}`, // Auto-generate user ID
          bookName: 'SMB Loan Application',
        }),
      });
      const json = await response.json();
      return json.accessToken;
    };
    setWidgetReady(true);
  }, []);

  // Listen for widget events
  const handleWidgetEvent = useCallback((event: MessageEvent) => {
    const data = event.data as WidgetEvent;
    
    if (!data?.type) return;

    // Handle specific events
    switch (data.type) {
      case 'USER_UPLOAD_RECEIVED':
        setUploadStats(prev => ({ ...prev, received: prev.received + (data.uploads?.length || 0) }));
        setSnackbar({ open: true, message: `${data.uploads?.length || 0} file(s) received`, severity: 'info' });
        break;
        
      case 'USER_UPLOAD_COMPLETE':
        setUploadStats(prev => ({ ...prev, completed: prev.completed + (data.uploads?.length || 0) }));
        setSnackbar({ open: true, message: `Document uploaded successfully!`, severity: 'success' });
        break;
        
      case 'USER_UPLOAD_FAILED':
        setUploadStats(prev => ({ ...prev, failed: prev.failed + (data.uploads?.length || 0) }));
        setSnackbar({ open: true, message: `Upload failed: ${data.uploads?.[0]?.message || 'Unknown error'}`, severity: 'error' });
        break;
        
      case 'LINK_SUCCESS':
        setBankConnected(true);
        setSnackbar({ open: true, message: 'Bank account connected successfully!', severity: 'success' });
        break;
        
      case 'PLAID_ERROR':
        setSnackbar({ open: true, message: data.error?.displayMessage || 'Bank connection error', severity: 'error' });
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleWidgetEvent);
    return () => window.removeEventListener('message', handleWidgetEvent);
  }, [handleWidgetEvent]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
          <Toolbar sx={{ py: 1 }}>
            <BusinessIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Ocrolus Example Broker
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Hero Banner */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%)',
            color: 'white',
            py: 4,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Business Loan Application
            </Typography>
          </Container>
        </Box>

        {/* Progress Stepper */}
        <Container maxWidth="lg" sx={{ mt: -3 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index < activeStep}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Container>

        {/* Main Content */}
        <Container maxWidth="lg">
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                    Submit Your Financial Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload bank statements or connect your bank account directly
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Widget Container */}
              <Box
                sx={{
                  minHeight: 300,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.50',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {!widgetReady && (
                  <Box sx={{ textAlign: 'center' }}>
                    <LinearProgress sx={{ width: 200, mb: 2 }} />
                    <Typography color="text.secondary">Loading widget...</Typography>
                  </Box>
                )}
                <Box
                  id="ocrolus-widget-frame"
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    display: widgetReady ? 'block' : 'none',
                  }}
                />
              </Box>

              {/* Upload Stats */}
              {(uploadStats.received > 0 || uploadStats.completed > 0 || bankConnected) && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {uploadStats.completed > 0 && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`${uploadStats.completed} document(s) uploaded`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {uploadStats.received > uploadStats.completed && (
                    <Chip
                      label={`${uploadStats.received - uploadStats.completed} processing...`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {uploadStats.failed > 0 && (
                    <Chip
                      label={`${uploadStats.failed} failed`}
                      color="error"
                      variant="outlined"
                    />
                  )}
                  {bankConnected && (
                    <Chip
                      icon={<AccountBalanceIcon />}
                      label="Bank connected"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>

        {/* Footer */}
        <Box sx={{ backgroundColor: 'primary.dark', color: 'white', py: 3, mt: 6 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                © 2026 Ocrolus Example Broker. Demo application for Ocrolus Widget Quickstart.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

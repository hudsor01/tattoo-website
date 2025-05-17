'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import Grid from '@/components/ui/mui-grid';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { inputSx } from '@/styles/mui-styles';

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#3b82f6',
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          <SettingsIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Configure application settings and preferences
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ backgroundColor: 'rgba(20, 20, 20, 0.7)', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#3b82f6',
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.5)',
              '&.Mui-selected': {
                color: '#3b82f6',
              },
            },
          }}
        >
          <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" sx={{ py: 2 }} />
          <Tab label="Business" icon={<BusinessIcon />} iconPosition="start" sx={{ py: 2 }} />
          <Tab label="Payments" icon={<PaymentIcon />} iconPosition="start" sx={{ py: 2 }} />
          <Tab label="Email" icon={<EmailIcon />} iconPosition="start" sx={{ py: 2 }} />
          <Tab label="Appearance" icon={<ColorLensIcon />} iconPosition="start" sx={{ py: 2 }} />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" sx={{ py: 2 }} />
        </Tabs>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ p: 3 }}>
          {/* Profile Settings */}
          <TabPanel value={tabValue} index={0}>
            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', mb: 3 }}>
              <CardHeader
                title="Personal Information"
                sx={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiCardHeader-title': {
                    color: 'white',
                    fontSize: '1.1rem',
                  },
                }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Name"
                      defaultValue="Fernando Govea"
                      fullWidth
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      defaultValue="fernando@ink37.com"
                      fullWidth
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Bio"
                      defaultValue="Professional tattoo artist specializing in custom designs with over 10 years of experience."
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                        },
                      }}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Business Settings */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', mb: 3 }}>
              <CardHeader
                title="Business Information"
                sx={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiCardHeader-title': {
                    color: 'white',
                    fontSize: '1.1rem',
                  },
                }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Business Name"
                      defaultValue="Ink 37 Custom Tattoos"
                      fullWidth
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Phone Number"
                      defaultValue="(555) 123-4567"
                      fullWidth
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      defaultValue="123 Tattoo Lane, Dallas, TX 75001"
                      fullWidth
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          defaultChecked
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#3b82f6',
                              '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                              },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#3b82f6',
                            },
                          }}
                        />
                      }
                      label="Display business address on website"
                      sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                        },
                      }}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Other tab panels would go here */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" color="white" gutterBottom>
              Payment Settings
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
              Payment settings content will be implemented in a future update.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" color="white" gutterBottom>
              Email Settings
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
              Email settings content will be implemented in a future update.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" color="white" gutterBottom>
              Appearance Settings
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
              Appearance settings content will be implemented in a future update.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" color="white" gutterBottom>
              Security Settings
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
              Security settings content will be implemented in a future update.
            </Typography>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Stack,
  Card,
  TablePagination,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import Grid from '@/components/ui/mui-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';

import { Lead, LeadSummary } from '@/types';

export default function LeadsSection() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<LeadSummary>({ total: 0, byType: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; leadId: number | null }>({
    open: false,
    leadId: null,
  });

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/admin/leads');
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const data = await response.json();
        setLeads(
          data.leads || [
            {
              id: 1001,
              name: 'Emily Johnson',
              email: 'emily.johnson@example.com',
              leadMagnetTitle: 'Tattoo Aftercare Guide',
              leadMagnetType: 'pdf',
              downloadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Interested in floral designs',
            },
            {
              id: 1002,
              name: 'Michael Rodriguez',
              email: 'm.rodriguez@example.com',
              leadMagnetTitle: 'Custom Tattoo Design Process',
              leadMagnetType: 'pdf',
              downloadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Looking for geometric sleeve design',
            },
            {
              id: 1003,
              name: 'Sophia Williams',
              email: 'sophia.w@example.com',
              leadMagnetTitle: 'Small Tattoos Collection',
              leadMagnetType: 'lookbook',
              downloadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'First-time tattoo customer',
            },
            {
              id: 1004,
              name: 'David Thompson',
              email: 'david.t@example.com',
              leadMagnetTitle: 'Tattoo Styles Guide',
              leadMagnetType: 'pdf',
              downloadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Interested in traditional style',
            },
            {
              id: 1005,
              name: 'Olivia Garcia',
              email: 'olivia.g@example.com',
              leadMagnetTitle: 'Tattoo Pain Scale Guide',
              leadMagnetType: 'infographic',
              downloadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Concerned about pain tolerance',
            },
          ]
        );
        setSummary(
          data.summary || {
            total: 5,
            byType: [
              { type: 'pdf', title: 'PDF Downloads', count: 3 },
              { type: 'lookbook', title: 'Lookbook Downloads', count: 1 },
              { type: 'infographic', title: 'Infographic Downloads', count: 1 },
            ],
          }
        );
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleDeleteLead = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/leads?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      // Remove the deleted lead from the state
      setLeads(leads.filter(lead => lead.id !== id));

      // Update summary count
      setSummary(prev => ({
        ...prev,
        total: prev.total - 1,
      }));

      // Close the dialog if the deleted lead was being viewed
      if (detailsDialogOpen && selectedLead?.id === id) {
        setDetailsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead. Please try again.');
    } finally {
      setConfirmDelete({ open: false, leadId: null });
    }
  };

  const exportLeadsAsCsv = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Lead Magnet', 'Download Date'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead =>
        [
          lead.name,
          lead.email,
          lead.leadMagnetTitle,
          new Date(lead.downloadDate).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ink37_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsDialogOpen(true);
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter(
    lead =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.leadMagnetTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current page of leads
  const displayedLeads = filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: 3,
          px: 4,
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(211, 47, 47, 0.3)',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              Lead Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Leads: {summary.total}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportLeadsAsCsv}
            sx={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Export as CSV
          </Button>
        </Box>

        {/* Lead stats cards */}
        <Grid container spacing={2}>
          {summary.byType.map(item => (
            <Grid item xs={12} md={4} key={item.type}>
              <Card
                sx={{
                  p: 2,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  backgroundImage: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {item.type === 'pdf' ? (
                  <PictureAsPdfIcon sx={{ color: '#E53935', fontSize: 36, mr: 2 }} />
                ) : item.type === 'lookbook' ? (
                  <DownloadIcon sx={{ color: '#42A5F5', fontSize: 36, mr: 2 }} />
                ) : (
                  <DownloadIcon sx={{ color: '#66BB6A', fontSize: 36, mr: 2 }} />
                )}
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
                    {item.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.title}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <TextField
          placeholder="Search leads..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#E53935' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Leads Table */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          mb: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Lead Magnet
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Download Date
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedLeads.map(lead => (
              <TableRow
                key={lead.id}
                hover
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onClick={() => handleViewDetails(lead)}
              >
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                >
                  {lead.id}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#E53935',
                        mr: 2,
                      }}
                    >
                      {lead.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {lead.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#E53935',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {lead.email}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                >
                  <Chip
                    icon={lead.leadMagnetType === 'pdf' ? <PictureAsPdfIcon /> : <DownloadIcon />}
                    label={lead.leadMagnetTitle}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.4)',
                      color: '#fff',
                      '& .MuiChip-icon': {
                        color:
                          lead.leadMagnetType === 'pdf'
                            ? '#E53935'
                            : lead.leadMagnetType === 'lookbook'
                              ? '#42A5F5'
                              : '#66BB6A',
                      },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                >
                  {new Date(lead.downloadDate).toLocaleDateString()}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EmailIcon />}
                      sx={{
                        bgcolor: '#1976d2',
                        '&:hover': {
                          bgcolor: '#1565c0',
                        },
                        textTransform: 'none',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        window.location.href = `mailto:${lead.email}`;
                      }}
                    >
                      Email
                    </Button>
                    <IconButton
                      size="small"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                          color: '#f44336',
                        },
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setConfirmDelete({ open: true, leadId: lead.id });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredLeads.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-toolbar': {
            color: 'rgba(255,255,255,0.7)',
          },
          '.MuiTablePagination-selectIcon': {
            color: 'rgba(255,255,255,0.7)',
          },
          '.MuiTablePagination-actions': {
            color: 'rgba(255,255,255,0.7)',
          },
        }}
      />

      {/* Lead Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1A1A1A',
            color: '#fff',
            borderRadius: 2,
            backgroundImage: 'none',
          },
        }}
      >
        {selectedLead && (
          <>
            <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  Lead Details
                </Typography>
                <Chip
                  label={`ID: ${selectedLead.id}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                />
              </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
              <Card
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  backgroundImage: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#E53935',
                        mr: 2,
                      }}
                    >
                      {selectedLead.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {selectedLead.name}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          icon={
                            selectedLead.leadMagnetType === 'pdf' ? (
                              <PictureAsPdfIcon />
                            ) : (
                              <DownloadIcon />
                            )
                          }
                          label={selectedLead.leadMagnetType || 'Download'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                            color: '#fff',
                            textTransform: 'capitalize',
                            '& .MuiChip-icon': {
                              color:
                                selectedLead.leadMagnetType === 'pdf'
                                  ? '#E53935'
                                  : selectedLead.leadMagnetType === 'lookbook'
                                    ? '#42A5F5'
                                    : '#66BB6A',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <EmailIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2">
                          <a
                            href={`mailto:${selectedLead.email}`}
                            style={{ color: '#E53935', textDecoration: 'none' }}
                          >
                            {selectedLead.email}
                          </a>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CalendarTodayIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2">
                          Downloaded on {new Date(selectedLead.downloadDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Lead Details */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
                Download Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      backgroundImage: 'none',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        gutterBottom
                        display="block"
                      >
                        LEAD MAGNET
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedLead.leadMagnetTitle}
                      </Typography>

                      {selectedLead.notes && (
                        <>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            gutterBottom
                            display="block"
                          >
                            NOTES
                          </Typography>
                          <Typography variant="body1">{selectedLead.notes}</Typography>
                        </>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                onClick={() => setDetailsDialogOpen(false)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                sx={{
                  bgcolor: '#d32f2f',
                  '&:hover': {
                    bgcolor: '#b71c1c',
                  },
                }}
                onClick={() => {
                  setDetailsDialogOpen(false);
                  setConfirmDelete({ open: true, leadId: selectedLead.id });
                }}
              >
                Delete Lead
              </Button>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                sx={{
                  bgcolor: '#1976d2',
                  '&:hover': {
                    bgcolor: '#1565c0',
                  },
                }}
                onClick={() => {
                  window.location.href = `mailto:${selectedLead.email}`;
                }}
              >
                Contact Lead
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, leadId: null })}
        PaperProps={{
          sx: {
            backgroundColor: '#1A1A1A',
            color: '#fff',
            borderRadius: 2,
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this lead? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDelete({ open: false, leadId: null })}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => confirmDelete.leadId && handleDeleteLead(confirmDelete.leadId)}
            variant="contained"
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': {
                bgcolor: '#b71c1c',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

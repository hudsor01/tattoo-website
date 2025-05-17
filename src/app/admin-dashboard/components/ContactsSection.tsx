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
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SubjectIcon from '@mui/icons-material/Subject';
import TextsmsIcon from '@mui/icons-material/Textsms';
import { Contact } from '@/types/contact';

export default function ContactsSection() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/admin/contacts');
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();

        // Use mock data if API returns empty or no contacts
        const mockContacts: Contact[] = [
          {
            id: '1001',
            name: 'Emily Johnson',
            email: 'emily.johnson@example.com',
            subject: 'Tattoo Design Consultation',
            message:
              "Hi, I'm interested in getting a floral sleeve tattoo and would like to schedule a consultation to discuss the design. I've been thinking about roses, lilies, and some greenery. Do you have availability in the next two weeks? Thanks!",
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '1002',
            name: 'Michael Rodriguez',
            email: 'm.rodriguez@example.com',
            subject: 'Tattoo Cover-up Question',
            message:
              "I have an old tribal tattoo on my shoulder that I'd like to cover up with something more meaningful. Could you let me know if this is something you specialize in? I can send photos of the current tattoo if that helps. Looking forward to your response.",
            read: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '1003',
            name: 'Sophia Williams',
            email: 'sophia.w@example.com',
            subject: 'Pricing Inquiry',
            message:
              "Hello, I'm considering getting a small minimalist tattoo on my wrist, about 2 inches in size. Could you provide me with a general price range for something like this? Also, how far in advance should I book an appointment? Thank you!",
            read: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '1004',
            name: 'David Thompson',
            email: 'david.t@example.com',
            subject: 'First-Time Tattoo Advice',
            message:
              "I'm planning to get my first tattoo and I'm a bit nervous. Do you have any advice for first-timers? I'm thinking about getting something on my forearm. Also, what should I do to prepare for my appointment? Thanks for any guidance you can offer!",
            read: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '1005',
            name: 'Olivia Garcia',
            email: 'olivia.g@example.com',
            subject: 'Aftercare Questions',
            message:
              "Hello, I recently got a tattoo from another studio and I'm having some concerns about the healing process. It seems to be scabbing more than expected. Would it be possible to get some professional advice on proper aftercare? I'd appreciate any help you can provide.",
            read: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

        // Set contacts from API or mock data if needed
        const contactsData =
          data.contacts && data.contacts.length > 0 ? data.contacts : mockContacts;
        setContacts(contactsData);

        // Calculate unread messages count
        setUnreadCount(contactsData.filter((contact: Contact) => !contact.read).length);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact status');
      }

      // Update the local state
      const updatedContacts = contacts.map(contact =>
        contact.id === id ? { ...contact, read: true } : contact
      );
      setContacts(updatedContacts);

      // Update unread count
      setUnreadCount(updatedContacts.filter(contact => !contact.read).length);

      // Update selected contact if it's the one being marked as read
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, read: true });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailsDialogOpen(true);

    // Mark as read when viewing details if not already read
    if (!contact.read) {
      handleMarkAsRead(contact.id);
    }
  };

  const exportContactsAsCsv = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Subject', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact =>
        [
          contact.name,
          contact.email,
          contact.subject || 'No subject',
          new Date(contact.createdAt).toLocaleDateString(),
          contact.read ? 'Read' : 'Unread',
        ].join(',')
      ),
    ].join('\n');

    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ink37_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.subject && contact.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current page of contacts
  const displayedContacts = filteredContacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  if (contacts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          No contact messages found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}
          >
            Contact Messages
            {unreadCount > 0 && <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }} />}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contacts.length} total messages, {unreadCount} unread
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={exportContactsAsCsv}
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          Export Data
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <TextField
          placeholder="Search contacts..."
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

      {/* Contacts Table */}
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
                Date
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                From
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Subject
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Preview
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color: 'rgba(255,255,255,0.7)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Status
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
            {displayedContacts.map(contact => (
              <TableRow
                key={contact.id}
                hover
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: !contact.read ? 'rgba(229, 57, 53, 0.05)' : 'transparent',
                }}
                onClick={() => handleViewDetails(contact)}
              >
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    fontWeight: !contact.read ? 'bold' : 'normal',
                  }}
                >
                  {new Date(contact.createdAt).toLocaleDateString()}
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
                      {contact.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: !contact.read ? 'bold' : 'medium',
                        }}
                      >
                        {contact.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: !contact.read ? 'bold' : 'normal',
                        }}
                      >
                        {contact.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    fontWeight: !contact.read ? 'bold' : 'normal',
                  }}
                >
                  {contact.subject || 'No subject'}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    maxWidth: 200,
                    fontWeight: !contact.read ? 'bold' : 'normal',
                  }}
                >
                  <Typography noWrap>{contact.message}</Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                >
                  {contact.read ? (
                    <Chip
                      icon={<MarkEmailReadIcon />}
                      label="Read"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(46, 125, 50, 0.2)',
                        color: '#4caf50',
                        '& .MuiChip-icon': {
                          color: '#4caf50',
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<MarkunreadIcon />}
                      label="Unread"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(211, 47, 47, 0.2)',
                        color: '#f44336',
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: '#f44336',
                        },
                      }}
                    />
                  )}
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
                      startIcon={<VisibilityIcon />}
                      sx={{
                        bgcolor: '#E53935',
                        '&:hover': {
                          bgcolor: '#d32f2f',
                        },
                        textTransform: 'none',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        handleViewDetails(contact);
                      }}
                    >
                      View
                    </Button>
                    {!contact.read && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          '&:hover': {
                            borderColor: 'rgba(255,255,255,0.3)',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                          },
                          textTransform: 'none',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleMarkAsRead(contact.id);
                        }}
                      >
                        Mark Read
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredContacts.length}
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

      {/* Contact Details Dialog */}
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
        {selectedContact && (
          <>
            <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  Contact Message
                </Typography>
                <Box>
                  <Chip
                    label={new Date(selectedContact.createdAt).toLocaleDateString()}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                      mr: 1,
                    }}
                  />
                  {selectedContact.read ? (
                    <Chip
                      icon={<MarkEmailReadIcon />}
                      label="Read"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(46, 125, 50, 0.2)',
                        color: '#4caf50',
                        '& .MuiChip-icon': {
                          color: '#4caf50',
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<MarkunreadIcon />}
                      label="Unread"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(211, 47, 47, 0.2)',
                        color: '#f44336',
                        '& .MuiChip-icon': {
                          color: '#f44336',
                        },
                      }}
                    />
                  )}
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
              {/* Contact Information Card */}
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
                      {selectedContact.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {selectedContact.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {selectedContact.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SubjectIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedContact.subject || 'No subject'}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Message Content */}
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 'medium', mt: 2, display: 'flex', alignItems: 'center' }}
              >
                <TextsmsIcon sx={{ mr: 1.5 }} />
                Message
              </Typography>

              <Card
                sx={{
                  bgcolor: 'rgba(0,0,0,0.2)',
                  backgroundImage: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedContact.message}
                  </Typography>
                </Box>
              </Card>
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
              {!selectedContact.read && (
                <Button
                  variant="contained"
                  startIcon={<MarkEmailReadIcon />}
                  sx={{
                    bgcolor: '#4caf50',
                    '&:hover': {
                      bgcolor: '#388e3c',
                    },
                  }}
                  onClick={() => handleMarkAsRead(selectedContact.id)}
                >
                  Mark as Read
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                sx={{
                  bgcolor: '#E53935',
                  '&:hover': {
                    bgcolor: '#d32f2f',
                  },
                }}
                onClick={() => {
                  window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your Inquiry'}`;
                }}
              >
                Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

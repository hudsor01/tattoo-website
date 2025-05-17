'use client';

import React from 'react';
import { login, signup } from './actions';
import { Paper, Container, Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export default function AdminLoginPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'rgba(18, 18, 18, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              color: 'primary.main',
              fontFamily: 'var(--font-pacifico)',
            }}
          >
            Ink 37
          </Typography>

          <LockIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
        </Box>

        {/* Using the standardized AuthForm component */}
        <form>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
          <button formAction={login}>Log in</button>
          <button formAction={signup}>Sign up</button>
        </form>
      </Paper>
    </Container>
  );
}

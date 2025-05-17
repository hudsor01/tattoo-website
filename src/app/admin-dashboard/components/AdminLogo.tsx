"use client";

import { Box, Typography } from "@mui/material";

interface AdminLogoProps {
  small?: boolean;
}

export default function AdminLogo({ small = false }: AdminLogoProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: small ? 32 : 40,
          height: small ? 32 : 40,
          borderRadius: 1,
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant={small ? "subtitle1" : "h6"}
          sx={{
            fontWeight: "bold",
            color: "primary.contrastText",
          }}
        >
          I37
        </Typography>
      </Box>
      
      {!small && (
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
      )}
    </Box>
  );
}
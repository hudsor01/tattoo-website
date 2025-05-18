"use client";

import { useState, useEffect } from "react";

interface LiveActivityIndicatorProps {
  pulse?: boolean;
  activeCount?: number;
}

export function LiveActivityIndicator({ 
  pulse = true, 
  activeCount = 0 
}: LiveActivityIndicatorProps) {
  const [blink, setBlink] = useState(true);

  // Create blinking effect
  useEffect(() => {
    if (!pulse) return;
    
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [pulse]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CircleIcon 
        color="success" 
        sx={{ 
          fontSize: 12,
          opacity: blink ? 1 : 0.5,
          transition: "opacity 0.5s ease",
        }} 
      />
      <Typography variant="body2" fontWeight={500}>
        LIVE
      </Typography>
      
      {activeCount > 0 && (
        <Chip 
          label={`${activeCount} active now`} 
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );
}

export default LiveActivityIndicator;
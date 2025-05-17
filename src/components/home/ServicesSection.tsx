'use client';

import { useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Button
} from "@mui/material";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";

// Dynamically import framer-motion to prevent SSR issues
const motion = dynamic(() => import('framer-motion').then((mod) => mod), { 
  ssr: false 
});

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  route: string;
}

const services: Service[] = [
  {
    id: "custom-designs",
    title: "Custom Designs",
    description: "Unique, personalized tattoo designs created specifically for you.",
    image: "/images/custom-designs.jpg",
    route: "/services#custom-designs",
  },
  {
    id: "cover-ups",
    title: "Cover-Ups",
    description: "Transform existing tattoos with expert cover-up techniques.",
    image: "/images/cover-ups.jpg",
    route: "/services#cover-ups",
  },
  {
    id: "traditional",
    title: "Traditional",
    description: "Bold lines and vibrant colors in classic American traditional style.",
    image: "/images/traditional.jpg",
    route: "/services#traditional",
  },
  {
    id: "realism",
    title: "Realism",
    description: "Detailed, lifelike tattoos that capture every nuance.",
    image: "/images/realism.jpg",
    route: "/services#realism",
  },
];

export function ServicesSection() {
  const router = useRouter();
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  return (
    <Box 
      component="section"
      sx={{ 
        py: { xs: 6, md: 10 },
        bgcolor: "background.paper",
      }}
    >
      <Container>
        <Box
          component={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          sx={{ textAlign: "center", mb: 6 }}
        >
          <Typography
            component={motion.div}
            variants={itemVariants}
            color="primary"
            fontWeight="medium"
            gutterBottom
            sx={{ textTransform: "uppercase" }}
          >
            Our Services
          </Typography>
          
          <Typography
            component={motion.div}
            variants={itemVariants}
            variant="h3"
            fontWeight="bold"
            gutterBottom
          >
            Tattoo Expertise & Specialties
          </Typography>
          
          <Typography
            component={motion.div}
            variants={itemVariants}
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
          >
            We offer a diverse range of tattoo styles and services to bring your vision to life with expert craftsmanship and precision.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3} 
              key={service.id}
              component={motion.div}
              variants={itemVariants}
            >
              <Card 
                sx={{ 
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s",
                  transform: hoveredService === service.id ? "translateY(-8px)" : "none",
                  boxShadow: hoveredService === service.id ? "0 12px 24px rgba(0,0,0,0.15)" : "0 4px 12px rgba(0,0,0,0.08)"
                }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <CardActionArea 
                  onClick={() => router.push(service.route)}
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{ textAlign: "center", mt: 6 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/services")}
          >
            View All Services
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default ServicesSection;
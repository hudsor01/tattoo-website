/**
 * Static tattoo services data
 * No database model needed - this is business content
 */
import { Palette, Camera, Mountain, Shapes, Heart, Brush, Star } from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  title: string; // Display title (often same as name)
  description: string;
  shortDescription: string; // Brief description for cards
  basePrice: number;
  duration: number; // minutes
  category: 'style' | 'size' | 'specialty';
  image?: string;
  icon?: React.ComponentType<{ className?: string }>; // Icon component
  features: string[];
}

export const TATTOO_SERVICES: Service[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    title: 'Traditional',
    description: 'Classic American traditional tattoo style with bold lines and vibrant colors',
    shortDescription: 'Bold lines and vibrant colors in classic American style',
    basePrice: 150,
    duration: 120,
    category: 'style',
    icon: Palette,
    features: ['Bold lines', 'Vibrant colors', 'Timeless designs']
  },
  {
    id: 'realism',
    name: 'Realism',
    title: 'Realism',
    description: 'Photorealistic tattoos with incredible detail and lifelike appearance',
    shortDescription: 'Photorealistic tattoos with incredible detail',
    basePrice: 200,
    duration: 180,
    category: 'style',
    icon: Camera,
    features: ['Photorealistic', 'High detail', 'Custom artwork']
  },
  {
    id: 'japanese',
    name: 'Japanese',
    title: 'Japanese',
    description: 'Traditional Japanese tattooing with cultural motifs and flowing designs',
    shortDescription: 'Cultural motifs and flowing traditional designs',
    basePrice: 180,
    duration: 150,
    category: 'style',
    icon: Mountain,
    features: ['Cultural motifs', 'Flowing designs', 'Rich symbolism']
  },
  {
    id: 'geometric',
    name: 'Geometric',
    title: 'Geometric',
    description: 'Modern geometric patterns and mathematical precision in design',
    shortDescription: 'Mathematical precision and modern aesthetics',
    basePrice: 160,
    duration: 120,
    category: 'style',
    icon: Shapes,
    features: ['Mathematical precision', 'Modern aesthetics', 'Clean lines']
  },
  {
    id: 'small',
    name: 'Small Tattoo',
    title: 'Small Tattoo',
    description: 'Small, detailed tattoos perfect for first-timers or minimalist designs',
    shortDescription: 'Perfect for first-timers or minimalist designs',
    basePrice: 80,
    duration: 60,
    category: 'size',
    icon: Star,
    features: ['Quick session', 'Perfect for beginners', 'Minimalist design']
  },
  {
    id: 'sleeve',
    name: 'Sleeve',
    title: 'Sleeve',
    description: 'Full arm sleeve tattoos with cohesive design and multiple sessions',
    shortDescription: 'Full arm tattoos with cohesive design',
    basePrice: 800,
    duration: 360,
    category: 'size',
    icon: Brush,
    features: ['Multiple sessions', 'Cohesive design', 'Large scale artwork']
  },
  {
    id: 'cover-up',
    name: 'Cover-up',
    title: 'Cover-up',
    description: 'Transform or cover existing tattoos with new artistic designs',
    shortDescription: 'Transform existing tattoos with new designs',
    basePrice: 250,
    duration: 180,
    category: 'specialty',
    icon: Heart,
    features: ['Existing tattoo coverage', 'Custom solutions', 'Artistic transformation']
  }
];

export const getServiceById = (id: string): Service | undefined => {
  return TATTOO_SERVICES.find(service => service.id === id);
};

export const getServicesByCategory = (category: Service['category']): Service[] => {
  return TATTOO_SERVICES.filter(service => service.category === category);
};

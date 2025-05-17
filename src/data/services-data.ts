import { FaPaintBrush, FaPortrait, FaRegGem, FaRedoAlt } from 'react-icons/fa';
import { Service } from '@/types/component-types';

/**
 * Shared services data
 * 
 * This centralized data file is used by both the homepage services section
 * and the full services page to ensure consistency across the site.
 */

export const services: Service[] = [
  {
    id: 'custom-designs',
    title: 'Custom Designs',
    description:
      'Every tattoo I create is a unique, personalized piece of art. I work collaboratively with you to transform your ideas into a design that perfectly captures your vision while incorporating artistic elements that will ensure your tattoo looks exceptional for years to come.',
    shortDescription: 'Unique, personalized tattoo designs created collaboratively with you to bring your vision to life with precision and artistry.',
    process: [
      'Initial consultation to discuss your vision',
      'Reference collection and inspiration sharing',
      'Sketch development and revisions',
      'Final design approval before tattooing',
    ],
    detailedProcess: [
      {
        title: 'Consultation',
        description: 'We begin with an in-depth discussion about your tattoo idea, exploring themes, symbolism, and personal meaning to ensure your vision is fully understood.'
      },
      {
        title: 'Design Development',
        description: 'I create custom sketches based on our consultation, refining the artwork through feedback to ensure it perfectly captures your vision before the tattoo session.'
      }
    ],
    image: '/images/custom-designs.jpg',
    icon: FaPaintBrush,
    color: 'blue',
  },
  {
    id: 'portraits',
    title: 'Portrait Tattoos',
    description:
      'I specialize in capturing the essence and likeness of your loved ones, pets, or iconic figures through realistic portrait tattoos. My attention to detail and shading techniques helps create depth and dimensionality that brings portraits to life on your skin.',
    shortDescription: 'Realistic portrait tattoos that capture the essence and detail of your loved ones, celebrities, or other meaningful subjects.',
    process: [
      'Consultation to discuss subject and reference photos',
      'Photo selection and enhancement for optimal results',
      'Design scaling and placement planning',
      'Detailed shading and highlighting techniques',
    ],
    detailedProcess: [
      {
        title: 'Photo Selection',
        description: 'We carefully select the ideal reference photo that captures the essence and details that make your subject special and will translate well to skin.'
      },
      {
        title: 'Portrait Technique',
        description: 'Using specialized shading techniques and meticulous attention to detail, I create realistic portraits with proper depth, contrast, and likeness.'
      }
    ],
    image: '/images/traditional.jpg',
    icon: FaPortrait,
    color: 'purple',
  },
  {
    id: 'fine-line',
    title: 'Fine Line & Detailed Work',
    description:
      'For those who appreciate subtlety and precision, my fine line work offers delicate, intricate designs with clean, precise lines. From minimalist tattoos to complex geometric patterns, I take pride in creating meticulous art that maintains clarity over time.',
    shortDescription: 'Intricate designs with clean lines and meticulous attention to detail, perfect for minimalist tattoos or complex geometric patterns.',
    process: [
      'Detailed planning of line placement and flow',
      'Precision outlining with specialized needles',
      'Careful consideration of design durability',
      'Light, strategic shading to enhance dimension',
    ],
    detailedProcess: [
      {
        title: 'Precision Techniques',
        description: 'I use specialized needles and techniques to create exceptionally fine, precise lines with consistent flow and minimal spreading over time.'
      },
      {
        title: 'Design Longevity',
        description: 'Every fine line design is created with careful consideration of how the tattoo will age, ensuring beautiful results both immediately and years later.'
      }
    ],
    image: '/images/realism.jpg',
    icon: FaRegGem,
    color: 'teal',
  },
  {
    id: 'cover-ups',
    title: 'Cover-Ups & Reworks',
    description:
      'Transform or refresh existing tattoos that no longer represent you. I am skilled at working with what you already have to create something new and beautiful. Whether you are looking to completely cover an old tattoo or rework it into a fresh design, I will develop a solution that works with your existing ink.',
    shortDescription: 'Transform or refresh existing tattoos with expert cover-ups or creative reworks that breathe new life into old art.',
    process: [
      'Assessment of your existing tattoo',
      'Discussion of cover-up possibilities',
      'Custom design that effectively conceals or transforms',
      'Strategic color and shading techniques',
    ],
    detailedProcess: [
      {
        title: 'Cover Analysis',
        description: "I thoroughly analyze your existing tattoo's ink density, age, and characteristics to determine the best approach for effective concealment or transformation."
      },
      {
        title: 'Strategic Design',
        description: 'Cover-up designs incorporate specific techniques like strategic shading and color theory to effectively integrate or conceal the original tattoo.'
      }
    ],
    image: '/images/cover-ups.jpg',
    icon: FaRedoAlt,
    color: 'red',
  },
];

export default services;
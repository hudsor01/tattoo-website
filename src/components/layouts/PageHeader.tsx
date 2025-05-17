'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: 'default' | 'red' | 'blue' | 'purple';
  size?: 'small' | 'medium' | 'large';
  alignment?: 'center' | 'left';
  children?: React.ReactNode;
  style?: 'default' | 'animated-stroke' | 'dynamic-cutout' | 'split-screen';
}

export default function PageHeader({
  title,
  subtitle,
  accentColor = 'default',
  size = 'medium',
  alignment = 'center',
  children,
  style = 'animated-stroke',
}: PageHeaderProps) {
  // Determine dynamic classes based on props
  const sizeClass = size === 'small' ? 'py-16' : size === 'large' ? 'py-28' : 'py-20';

  const alignmentClass = alignment === 'center' ? 'text-center' : 'text-left';

  // Get the accent color values for various components
  const accentColorValue =
    accentColor === 'red'
      ? '#ff4136'
      : accentColor === 'blue'
        ? '#0074d9'
        : accentColor === 'purple'
          ? '#7928ca'
          : '#666666';

  // Gradient backgrounds based on accent color
  const gradientBg =
    accentColor === 'red'
      ? 'bg-gradient-to-br from-black via-black to-tattoo-red/10'
      : accentColor === 'blue'
        ? 'bg-gradient-to-br from-black via-black to-tattoo-blue/10'
        : accentColor === 'purple'
          ? 'bg-gradient-to-br from-black via-black to-purple-900/10'
          : 'bg-gradient-to-br from-black via-black to-gray-900';

  // Accent element color
  const accentBlockColor =
    accentColor === 'red'
      ? 'bg-tattoo-red'
      : accentColor === 'blue'
        ? 'bg-tattoo-blue'
        : accentColor === 'purple'
          ? 'bg-purple-700'
          : 'bg-gray-700';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Define SVG paths for the animation
  const svgPaths = [
    // Abstract tribal pattern
    'M10,50 C50,30 90,60 130,40 C170,20 210,50 250,30 C290,10 330,40 370,20 C410,0 450,30 490,10',
    // Curved line
    'M5,100 C60,70 120,140 180,110 C240,80 300,150 360,120 C420,90 480,160 540,130',
    // Abstract floral/mandala element
    'M250,80 C260,70 270,60 290,70 C310,80 305,100 290,110 C275,120 250,115 240,100 C230,85 240,70 250,80',
    // Abstract geometric tattoo element
    'M100,150 L120,180 L140,150 L160,180 L180,150 L200,180 L220,150',
    // Decorative swirl
    'M350,140 C370,130 390,150 400,170 C410,190 400,210 380,220 C360,230 340,210 330,190 C320,170 330,150 350,140',
  ];

  // Animation control for the SVG paths
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: 'spring', duration: 2.5, bounce: 0 },
        opacity: { duration: 0.5 },
      },
    },
  };

  // Handle cursor interaction for paths
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;

      // Subtly move paths based on cursor position
      const paths = svgRef.current.querySelectorAll('path');
      paths.forEach((path, index) => {
        const factor = (index + 1) * 0.5;
        const dx = ((x - svgRect.width / 2) / svgRect.width) * 10 * factor;
        const dy = ((y - svgRect.height / 2) / svgRect.height) * 5 * factor;

        path.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };

    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (svgElement) {
        svgElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  if (style === 'animated-stroke') {
    return (
      <section
        className={`relative ${sizeClass} ${gradientBg} overflow-hidden border-b border-white/5`}
      >
        {/* SVG Canvas for animated strokes */}
        <motion.svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full z-0"
          viewBox="0 0 600 250"
          initial="hidden"
          animate="visible"
          preserveAspectRatio="xMidYMid slice"
        >
          {svgPaths.map((path, index) => (
            <motion.path
              key={index}
              d={path}
              variants={pathVariants}
              stroke={accentColorValue}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              custom={index}
              style={{
                opacity: 0.6 - index * 0.1,
                transition: 'transform 0.3s ease-out',
              }}
            />
          ))}
        </motion.svg>

        {/* Accent block */}
        <div
          className={`absolute ${alignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8 sm:left-16'} -bottom-4 h-8 w-20 ${accentBlockColor} opacity-30 blur-xl`}
        ></div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            className={`mx-auto max-w-4xl ${alignmentClass}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {alignment === 'left' && (
              <motion.div
                className={`h-1 w-16 ${accentBlockColor} mb-6`}
                variants={itemVariants}
              ></motion.div>
            )}

            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
              variants={itemVariants}
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                className={`text-lg text-white/80 ${alignment === 'center' ? 'max-w-xl mx-auto' : 'max-w-2xl'} mb-6`}
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
            )}

            {children && (
              <motion.div variants={itemVariants} className="mt-8">
                {children}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  if (style === 'dynamic-cutout') {
    // Create a set of cutout shapes for masking
    const cutoutShapes = [
      // Geometric cutout
      'M50,20 L120,20 L150,50 L120,80 L50,80 L20,50 Z',
      // Circular cutout
      'M280,50 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0',
      // Diamond shapes
      'M180,100 L220,80 L260,100 L220,120 Z',
      // Tribal pattern cutout
      'M350,120 C380,100 410,120 440,100 C470,80 500,100 530,80',
      // Abstract shape
      'M80,150 C100,130 120,150 140,130 L180,170 C160,190 140,170 120,190 Z',
    ];

    return (
      <section
        className={`relative ${sizeClass} ${gradientBg} overflow-hidden border-b border-white/5`}
      >
        {/* Background texture */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Cutout mask layer */}
        <div className="absolute inset-0 backdrop-blur-[1px]">
          <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid slice">
            <defs>
              <mask id="cutoutMask">
                <rect width="100%" height="100%" fill="white" />
                {cutoutShapes.map((shape, index) => (
                  <motion.path
                    key={index}
                    d={shape}
                    fill="black"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: [0, 5, 0, -5, 0][index % 5],
                      y: [0, -3, 0, 3, 0][index % 5],
                    }}
                    transition={{
                      x: { repeat: Infinity, duration: 10 + index, ease: 'easeInOut' },
                      y: { repeat: Infinity, duration: 12 + index, ease: 'easeInOut' },
                      opacity: { duration: 1, delay: index * 0.2 },
                    }}
                  />
                ))}
              </mask>
            </defs>

            {/* Artistic background that shows through cutouts */}
            <motion.rect
              width="100%"
              height="100%"
              mask="url(#cutoutMask)"
              fill={`url(#artisticGradient-${accentColor})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1.5 }}
            />

            {/* Gradient definitions for the background */}
            <defs>
              <linearGradient id={`artisticGradient-${accentColor}`} gradientTransform="rotate(45)">
                <stop offset="0%" stopColor={accentColorValue} stopOpacity="0.3" />
                <stop offset="50%" stopColor={accentColorValue} stopOpacity="0.7" />
                <stop offset="100%" stopColor={accentColorValue} stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            className={`mx-auto max-w-4xl ${alignmentClass}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {alignment === 'left' && (
              <motion.div
                className={`h-1 w-16 ${accentBlockColor} mb-6`}
                variants={itemVariants}
              ></motion.div>
            )}

            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
              variants={itemVariants}
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                className={`text-lg text-white/80 ${alignment === 'center' ? 'max-w-xl mx-auto' : 'max-w-2xl'} mb-6`}
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
            )}

            {children && (
              <motion.div variants={itemVariants} className="mt-8">
                {children}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  if (style === 'split-screen') {
    return (
      <section className={`relative ${sizeClass} overflow-hidden border-b border-white/5`}>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Content side */}
          <div
            className={`md:col-span-2 ${gradientBg} relative z-10 flex items-center justify-center py-16 md:py-0`}
          >
            <motion.div
              className={`w-full px-8 ${alignmentClass} md:text-left`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {alignment === 'left' && (
                <motion.div
                  className={`h-1 w-16 ${accentBlockColor} mb-6`}
                  variants={itemVariants}
                ></motion.div>
              )}

              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
                variants={itemVariants}
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p className="text-lg text-white/80 mb-6" variants={itemVariants}>
                  {subtitle}
                </motion.p>
              )}

              {children && (
                <motion.div variants={itemVariants} className="mt-8">
                  {children}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Visual side with abstract elements */}
          <div className="md:col-span-3 bg-black relative overflow-hidden">
            {/* Abstract decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                {/* Abstract shape 1 */}
                <motion.div
                  className={`absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-tr from-transparent to-${accentColor === 'red' ? 'tattoo-red' : accentColor === 'blue' ? 'tattoo-blue' : 'purple-700'}/20 blur-xl`}
                  initial={{ x: -50, y: -50, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 0.7 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />

                {/* Abstract shape 2 */}
                <motion.div
                  className={`absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-gradient-to-bl from-transparent to-${accentColor === 'red' ? 'tattoo-red' : accentColor === 'blue' ? 'tattoo-blue' : 'purple-700'}/30 blur-xl`}
                  initial={{ x: 50, y: 50, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 0.4 }}
                />

                {/* Dynamic SVG elements */}
                <svg className="absolute inset-0 w-full h-full">
                  {svgPaths.slice(0, 3).map((path, index) => (
                    <motion.path
                      key={index}
                      d={path}
                      stroke={accentColorValue}
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 - index * 0.1 }}
                      transition={{
                        pathLength: { duration: 2, delay: index * 0.5 },
                        opacity: { duration: 1, delay: index * 0.5 },
                      }}
                    />
                  ))}
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fall back to standard header if other styles not implemented yet
  return (
    <section
      className={`relative ${sizeClass} ${gradientBg} overflow-hidden border-b border-white/5`}
    >
      <div className="absolute top-0 left-0 h-0.5 w-1/3 bg-gradient-to-r from-white/5 to-transparent"></div>
      <div className="absolute bottom-0 right-0 h-0.5 w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>

      {/* Accent block */}
      <div
        className={`absolute ${alignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8 sm:left-16'} -bottom-4 h-8 w-20 ${accentBlockColor} opacity-30 blur-xl`}
      ></div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          className={`mx-auto max-w-4xl ${alignmentClass}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {alignment === 'left' && (
            <motion.div
              className={`h-1 w-16 ${accentBlockColor} mb-6`}
              variants={itemVariants}
            ></motion.div>
          )}

          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              className={`text-lg text-white/80 ${alignment === 'center' ? 'max-w-xl mx-auto' : 'max-w-2xl'} mb-6`}
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div variants={itemVariants} className="mt-8">
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
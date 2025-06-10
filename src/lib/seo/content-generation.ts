import { generateAdvancedMetadata } from './advanced-meta-tags';
import { seoConfig } from './seo-config';

export interface GuideContent {
  slug: string;
  title: string;
  description: string;
  category: 'aftercare' | 'styles' | 'process' | 'preparation' | 'pricing';
  keywords: string[];
  readTime: string;
  lastUpdated: string;
  sections: GuideSection[];
  faq: FAQ[];
  relatedGuides: string[];
}

export interface GuideSection {
  title: string;
  content: string[];
  subsections?: {
    title: string;
    content: string[];
  }[];
}

export interface FAQ {
  question: string;
  answer: string;
}

// Comprehensive guide content for tattoo education and SEO
export const TATTOO_GUIDES: Record<string, GuideContent> = {
  'tattoo-aftercare-guide': {
    slug: 'tattoo-aftercare-guide',
    title: 'Complete Tattoo Aftercare Guide 2025 | Expert Tips for Healing',
    description: 'Professional tattoo aftercare instructions from expert artists. Learn proper healing techniques, what products to use, and how to keep your new tattoo looking its best.',
    category: 'aftercare',
    keywords: [
      'tattoo aftercare',
      'tattoo healing process',
      'new tattoo care instructions',
      'tattoo aftercare products',
      'how to care for new tattoo',
      'tattoo healing timeline',
      'tattoo aftercare cream',
      'tattoo washing instructions',
    ],
    readTime: '8 min read',
    lastUpdated: '2025-06-10',
    sections: [
      {
        title: 'Immediate Aftercare (First 24-48 Hours)',
        content: [
          'Your tattoo artist will cover your new tattoo with a protective bandage or wrap. This initial covering protects your fresh tattoo from bacteria and helps prevent bleeding.',
          'Keep the initial bandage on for 2-4 hours, or as directed by your tattoo artist. Some artists may use advanced healing wraps that can stay on for several days.',
          'When removing the bandage, wash your hands thoroughly first, then gently remove the covering. If it sticks, wet it with warm water to make removal easier.',
        ],
        subsections: [
          {
            title: 'First Wash',
            content: [
              'Use lukewarm water and unscented, gentle soap to clean your tattoo',
              'Gently pat the area dry with a clean paper towel - never rub',
              'Apply a thin layer of recommended aftercare ointment',
            ],
          },
        ],
      },
      {
        title: 'Days 2-14: The Healing Process',
        content: [
          'Your tattoo will go through several stages of healing during this critical period.',
          'Days 2-3: Your tattoo may feel tender and appear slightly swollen. This is normal.',
          'Days 4-6: Peeling and flaking will begin. Do not pick or scratch the peeling skin.',
          'Days 7-14: The outer layer of skin will continue to heal and regenerate.',
        ],
        subsections: [
          {
            title: 'Daily Care Routine',
            content: [
              'Wash 2-3 times daily with unscented soap',
              'Apply thin layers of aftercare lotion',
              'Keep the tattoo moisturized but not over-saturated',
              'Wear loose, breathable clothing',
            ],
          },
        ],
      },
      {
        title: 'Long-term Care (Weeks 2-8)',
        content: [
          'Continue gentle care as your tattoo fully heals from the inside out.',
          'The tattoo may appear dull or cloudy - this is the final healing stage.',
          'By week 4-6, your tattoo should be fully healed on the surface.',
          'Complete healing can take up to 8 weeks for deeper layers.',
        ],
      },
      {
        title: 'Products to Use and Avoid',
        content: [
          'Recommended: Unscented soaps, specialized tattoo aftercare products, or plain moisturizers',
          'Avoid: Petroleum-based products, scented lotions, alcohol-based products, and hydrogen peroxide',
        ],
        subsections: [
          {
            title: 'Best Aftercare Products',
            content: [
              'Aquaphor Healing Ointment (first few days only)',
              'Cetaphil or CeraVe unscented moisturizers',
              'Specialized tattoo aftercare brands like Hustle Butter or After Inked',
              'Mild, unscented soaps like Dial Gold or Cetaphil',
            ],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'How long does a tattoo take to heal completely?',
        answer: 'Surface healing typically takes 2-4 weeks, while complete healing of all skin layers can take 6-8 weeks. Larger tattoos may take longer.',
      },
      {
        question: 'Can I shower with a new tattoo?',
        answer: 'Yes, you can shower, but avoid soaking the tattoo. Keep showers short and avoid direct water pressure on the tattoo.',
      },
      {
        question: 'What should I do if my tattoo looks infected?',
        answer: 'Signs of infection include excessive redness, swelling, pus, red streaking, or fever. Contact your tattoo artist and consider seeing a doctor immediately.',
      },
      {
        question: 'When can I go swimming with a new tattoo?',
        answer: 'Wait at least 2-4 weeks before swimming in pools, hot tubs, or natural bodies of water to prevent infection.',
      },
    ],
    relatedGuides: ['tattoo-preparation-guide', 'tattoo-healing-process', 'tattoo-touch-up-guide'],
  },

  'traditional-tattoo-style-guide': {
    slug: 'traditional-tattoo-style-guide',
    title: 'American Traditional Tattoo Style Guide | History, Characteristics & Artists',
    description: 'Complete guide to American Traditional tattoo style. Learn about the history, characteristic elements, famous artists, and design principles of this iconic tattoo style.',
    category: 'styles',
    keywords: [
      'american traditional tattoos',
      'traditional tattoo style',
      'old school tattoos',
      'traditional tattoo designs',
      'american traditional artists',
      'traditional tattoo flash',
      'sailor jerry tattoos',
      'traditional tattoo history',
    ],
    readTime: '12 min read',
    lastUpdated: '2025-06-10',
    sections: [
      {
        title: 'What is American Traditional Tattooing?',
        content: [
          'American Traditional tattooing, also known as "Old School," is one of the most recognizable and enduring styles in tattoo history.',
          'Characterized by bold black outlines, limited color palettes, and iconic imagery, this style emerged in the early 1900s.',
          'The style emphasizes readability, longevity, and timeless appeal over intricate detail.',
        ],
      },
      {
        title: 'Key Characteristics',
        content: [
          'Bold, thick black outlines that define the entire design',
          'Limited color palette: primarily red, yellow, green, blue, and black',
          'Simple, iconic imagery with symbolic meaning',
          'Solid color fill with minimal shading',
          'Designs that age well and remain clear over time',
        ],
        subsections: [
          {
            title: 'Classic Design Elements',
            content: [
              'Anchors, ships, and nautical themes',
              'Eagles, panthers, and other bold animals',
              'Hearts, daggers, and roses',
              'Pin-up girls and portraits',
              'Banners with text or names',
            ],
          },
        ],
      },
      {
        title: 'Historical Background',
        content: [
          'American Traditional style developed in the early 20th century, influenced by military culture and maritime traditions.',
          'Sailors would get tattooed in port cities, spreading designs and techniques globally.',
          'Norman "Sailor Jerry" Collins standardized many techniques and designs in the 1930s-1960s.',
          'The style represented rebellion, adventure, and personal milestones.',
        ],
      },
      {
        title: 'Modern Traditional Tattooing',
        content: [
          'Contemporary artists continue to evolve the style while respecting its foundations.',
          'Modern Traditional incorporates updated techniques and expanded color palettes.',
          'Artists like Mike Giant, Marcus Pacheco, and Filip Leu have advanced the style.',
          'The style remains popular for its timeless appeal and aging characteristics.',
        ],
      },
    ],
    faq: [
      {
        question: 'How much do traditional tattoos cost?',
        answer: 'Traditional tattoos typically cost $100-500+ depending on size and complexity. The bold style often requires fewer sessions than detailed styles.',
      },
      {
        question: 'Do traditional tattoos age better than other styles?',
        answer: 'Yes, the bold outlines and solid colors of traditional tattoos typically age very well, maintaining clarity and impact over decades.',
      },
      {
        question: 'Can traditional tattoos be customized?',
        answer: 'Absolutely! While traditional tattoos use classic elements, they can be personalized with custom text, color choices, and arrangement.',
      },
    ],
    relatedGuides: ['japanese-tattoo-style-guide', 'tattoo-style-comparison', 'choosing-tattoo-style'],
  },

  'tattoo-pricing-guide': {
    slug: 'tattoo-pricing-guide',
    title: 'Tattoo Pricing Guide 2025 | How Much Do Tattoos Cost in Texas?',
    description: 'Comprehensive guide to tattoo pricing in Texas. Learn about factors affecting cost, average prices by size, and how to budget for your tattoo project.',
    category: 'pricing',
    keywords: [
      'tattoo cost',
      'how much do tattoos cost',
      'tattoo pricing texas',
      'tattoo price calculator',
      'small tattoo cost',
      'large tattoo price',
      'tattoo hourly rate',
      'dallas tattoo prices',
    ],
    readTime: '10 min read',
    lastUpdated: '2025-06-10',
    sections: [
      {
        title: 'Factors That Affect Tattoo Pricing',
        content: [
          'Size: Larger tattoos require more time and materials',
          'Complexity: Detailed designs take longer to complete',
          'Placement: Some body areas are more challenging to tattoo',
          'Artist experience: Established artists typically charge higher rates',
          'Geographic location: Prices vary by region and studio overhead',
          'Color vs. black and grey: Color tattoos often cost more',
        ],
      },
      {
        title: 'Average Tattoo Costs by Size',
        content: [
          'These are general estimates - actual prices may vary based on design complexity and artist.',
        ],
        subsections: [
          {
            title: 'Small Tattoos (2-4 inches)',
            content: [
              'Simple designs: $80-200',
              'Detailed work: $200-400',
              'Examples: Small symbols, names, simple animals',
            ],
          },
          {
            title: 'Medium Tattoos (4-6 inches)', 
            content: [
              'Standard rate: $300-600',
              'Complex designs: $600-1,000',
              'Examples: Portraits, detailed animals, medium florals',
            ],
          },
          {
            title: 'Large Tattoos (6+ inches)',
            content: [
              'Simple large pieces: $800-1,500',
              'Detailed large work: $1,500-3,000+',
              'Examples: Back pieces, sleeves, large chest pieces',
            ],
          },
        ],
      },
      {
        title: 'Hourly Rates vs. Fixed Pricing',
        content: [
          'Many artists charge by the hour, typically $150-300+ in the DFW area',
          'Simple, standard designs may have fixed pricing',
          'Complex custom work is usually priced hourly',
          'Multiple sessions may be required for large pieces',
        ],
      },
      {
        title: 'Additional Costs to Consider',
        content: [
          'Consultation fees (often applied to final cost)',
          'Touch-up sessions (usually included within 30-60 days)',
          'Aftercare products',
          'Tip for your artist (15-20% is standard)',
        ],
      },
    ],
    faq: [
      {
        question: 'Why do tattoo prices vary so much?',
        answer: 'Prices reflect the artist\'s skill level, studio overhead, design complexity, and time investment. Quality work requires experienced artists and proper equipment.',
      },
      {
        question: 'Should I choose an artist based on price?',
        answer: 'Price should not be the primary factor. Focus on the artist\'s portfolio, experience, and hygiene standards. Quality tattoos are an investment.',
      },
      {
        question: 'Do you offer payment plans?',
        answer: 'Many studios offer payment plans for larger pieces. Discuss options during your consultation to find a solution that works for your budget.',
      },
    ],
    relatedGuides: ['tattoo-consultation-guide', 'choosing-tattoo-artist', 'tattoo-preparation-guide'],
  },

  'japanese-tattoo-style-guide': {
    slug: 'japanese-tattoo-style-guide',
    title: 'Japanese Tattoo Style Guide | Irezumi Tradition, Symbols & Meanings',
    description: 'Complete guide to Japanese tattoo style (Irezumi). Learn about traditional motifs, cultural meanings, design principles, and the rich history of Japanese tattooing.',
    category: 'styles',
    keywords: [
      'japanese tattoos',
      'irezumi tattoos',
      'japanese tattoo meanings',
      'koi fish tattoo',
      'dragon tattoo japanese',
      'cherry blossom tattoo',
      'japanese tattoo symbols',
      'traditional japanese tattoo',
    ],
    readTime: '15 min read',
    lastUpdated: '2025-06-10',
    sections: [
      {
        title: 'Introduction to Japanese Tattooing (Irezumi)',
        content: [
          'Japanese tattooing, known as Irezumi, has a rich history spanning over 300 years.',
          'The art form combines traditional Japanese aesthetics with deep cultural symbolism.',
          'Irezumi is characterized by large-scale designs, flowing compositions, and meaningful imagery.',
          'The style emphasizes harmony between elements and the body\'s natural contours.',
        ],
      },
      {
        title: 'Traditional Japanese Motifs and Meanings',
        content: [
          'Each element in Japanese tattooing carries specific symbolism and cultural significance.',
        ],
        subsections: [
          {
            title: 'Dragons (Ryu)',
            content: [
              'Symbolize wisdom, strength, and protection',
              'Often depicted with clouds, water, or flames',
              'Japanese dragons are benevolent, unlike Western interpretations',
              'Popular in full back pieces and sleeves',
            ],
          },
          {
            title: 'Koi Fish',
            content: [
              'Represent perseverance, courage, and achievement',
              'Swimming upstream symbolizes overcoming obstacles',
              'Different colors carry different meanings',
              'Often paired with water elements and cherry blossoms',
            ],
          },
          {
            title: 'Cherry Blossoms (Sakura)',
            content: [
              'Symbolize the beauty and fragility of life',
              'Represent the transient nature of existence',
              'Popular background element in many designs',
              'Associated with renewal and hope',
            ],
          },
          {
            title: 'Tigers (Tora)',
            content: [
              'Represent courage, strength, and protection from evil',
              'Often depicted with bamboo or wind elements',
              'Symbolize power and royal dignity',
              'Popular choice for large-scale pieces',
            ],
          },
        ],
      },
      {
        title: 'Design Principles and Composition',
        content: [
          'Japanese tattoos follow specific compositional rules for visual harmony.',
          'Background elements (clouds, waves, wind) create flow and movement.',
          'Color palette traditionally includes black, red, yellow, and green.',
          'Designs often incorporate negative space for balance.',
          'Large pieces are planned to flow with the body\'s natural lines.',
        ],
      },
      {
        title: 'Modern Japanese Tattooing',
        content: [
          'Contemporary artists blend traditional techniques with modern approaches.',
          'International artists have brought new perspectives to the style.',
          'Modern equipment allows for finer detail and smoother gradations.',
          'The style continues to evolve while respecting traditional foundations.',
        ],
      },
    ],
    faq: [
      {
        question: 'How long does a Japanese tattoo take to complete?',
        answer: 'Large Japanese pieces often require multiple sessions over several months. A full back piece might take 40-100+ hours depending on detail and size.',
      },
      {
        question: 'Are there cultural considerations for Japanese tattoos?',
        answer: 'While appreciation of the art form is welcome, it\'s important to understand the cultural significance and work with knowledgeable artists who respect the tradition.',
      },
      {
        question: 'What\'s the difference between Japanese and American traditional tattoos?',
        answer: 'Japanese tattoos emphasize flowing, large-scale compositions with cultural symbolism, while American traditional focuses on bold, simple designs with thick outlines.',
      },
    ],
    relatedGuides: ['traditional-tattoo-style-guide', 'tattoo-symbolism-guide', 'large-scale-tattoo-planning'],
  },

  'tattoo-preparation-guide': {
    slug: 'tattoo-preparation-guide', 
    title: 'How to Prepare for Your Tattoo Appointment | Complete Pre-Tattoo Guide',
    description: 'Essential preparation tips for your tattoo appointment. Learn what to do before getting tattooed, what to bring, and how to ensure the best experience.',
    category: 'preparation',
    keywords: [
      'tattoo preparation',
      'before getting tattoo',
      'tattoo appointment tips',
      'what to eat before tattoo',
      'tattoo preparation checklist',
      'first tattoo tips',
      'tattoo consultation',
      'preparing for large tattoo',
    ],
    readTime: '7 min read',
    lastUpdated: '2025-06-10',
    sections: [
      {
        title: '24-48 Hours Before Your Appointment',
        content: [
          'Get a good night\'s sleep to ensure your body is rested and ready.',
          'Stay hydrated by drinking plenty of water.',
          'Avoid alcohol and excessive caffeine, which can thin your blood.',
          'Don\'t get sunburned in the area to be tattooed.',
        ],
        subsections: [
          {
            title: 'Skin Preparation',
            content: [
              'Moisturize the area daily to keep skin healthy',
              'Avoid harsh exfoliation or chemical peels',
              'Don\'t shave the area yourself - let your artist do it',
              'Avoid new skincare products that might cause reactions',
            ],
          },
        ],
      },
      {
        title: 'Day of Your Appointment',
        content: [
          'Eat a substantial meal 1-2 hours before your appointment.',
          'Shower and wear clean, comfortable clothing.',
          'Arrive on time or slightly early.',
          'Bring entertainment for longer sessions.',
        ],
        subsections: [
          {
            title: 'What to Bring',
            content: [
              'Valid photo ID',
              'Payment method (cash often preferred)',
              'Snacks and water for longer sessions',
              'Phone charger or entertainment',
              'Reference images if applicable',
            ],
          },
          {
            title: 'What to Wear',
            content: [
              'Comfortable clothing you don\'t mind getting ink on',
              'Easy access to the tattoo area',
              'Layers in case the studio is cold',
              'Closed-toe shoes for hygiene',
            ],
          },
        ],
      },
      {
        title: 'Mental Preparation',
        content: [
          'Understand that some discomfort is normal.',
          'Practice relaxation techniques like deep breathing.',
          'Trust your artist\'s expertise and experience.',
          'Communicate openly about any concerns.',
        ],
      },
      {
        title: 'Things to Avoid',
        content: [
          'Don\'t drink alcohol 24 hours before your appointment.',
          'Avoid blood-thinning medications unless prescribed.',
          'Don\'t bring large groups of friends.',
          'Avoid getting tattooed if you\'re sick.',
          'Don\'t rush the design process.',
        ],
      },
    ],
    faq: [
      {
        question: 'What should I eat before getting a tattoo?',
        answer: 'Eat a balanced meal with protein and complex carbohydrates 1-2 hours before. Avoid heavy, greasy foods that might make you feel sick.',
      },
      {
        question: 'Can I bring friends to my tattoo appointment?',
        answer: 'Most studios allow one support person, but large groups can be disruptive. Check with your artist about their policy.',
      },
      {
        question: 'Should I take pain medication before getting tattooed?',
        answer: 'Avoid aspirin and ibuprofen as they can increase bleeding. Acetaminophen (Tylenol) is generally okay, but check with your artist.',
      },
      {
        question: 'What if I need to reschedule my appointment?',
        answer: 'Contact your artist as soon as possible. Most require 24-48 hours notice to avoid cancellation fees.',
      },
    ],
    relatedGuides: ['tattoo-aftercare-guide', 'tattoo-pain-management', 'choosing-tattoo-design'],
  },
};

/**
 * Generate metadata for guide pages
 */
export function generateGuideMetadata(guideSlug: string) {
  const guide = TATTOO_GUIDES[guideSlug];
  
  if (!guide) {
    throw new Error(`Guide ${guideSlug} not found`);
  }

  return generateAdvancedMetadata({
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    canonical: `/guides/${guideSlug}`,
    ogType: 'article',
    publishedTime: guide.lastUpdated,
    modifiedTime: guide.lastUpdated,
    section: guide.category,
    tags: guide.keywords,
  });
}

/**
 * Generate structured data for guide pages
 */
export function generateGuideStructuredData(guideSlug: string) {
  const guide = TATTOO_GUIDES[guideSlug];
  
  if (!guide) {
    throw new Error(`Guide ${guideSlug} not found`);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${seoConfig.siteUrl}/guides/${guideSlug}#article`,
    headline: guide.title,
    description: guide.description,
    image: `${seoConfig.siteUrl}/images/traditional.jpg`,
    author: {
      '@type': 'Person',
      name: seoConfig.artistName,
      url: seoConfig.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.businessName,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}${seoConfig.logo}`,
      },
    },
    datePublished: guide.lastUpdated,
    dateModified: guide.lastUpdated,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.siteUrl}/guides/${guideSlug}`,
    },
    articleSection: guide.category,
    keywords: guide.keywords.join(', '),
    wordCount: guide.sections.reduce((count, section) => {
      return count + section.content.join(' ').split(' ').length;
    }, 0),
    timeRequired: guide.readTime,
    about: {
      '@type': 'Thing',
      name: 'Tattoo Education',
      description: 'Professional tattoo information and guidance',
    },
    mentions: [
      {
        '@type': 'LocalBusiness',
        name: seoConfig.businessName,
        url: seoConfig.siteUrl,
      },
    ],
  };
}

/**
 * Generate FAQ structured data for guide pages
 */
export function generateGuideFAQStructuredData(guideSlug: string) {
  const guide = TATTOO_GUIDES[guideSlug];
  
  if (!guide || !guide.faq.length) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${seoConfig.siteUrl}/guides/${guideSlug}#faq`,
    mainEntity: guide.faq.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Get all guide slugs for dynamic routing
 */
export function getAllGuideSlugs(): string[] {
  return Object.keys(TATTOO_GUIDES);
}

/**
 * Get guide data by slug
 */
export function getGuideData(slug: string): GuideContent | null {
  return TATTOO_GUIDES[slug] || null;
}

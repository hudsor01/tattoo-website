'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useCookies } from '@/hooks/use-cookies';

// Define window with gtag
interface WindowWithGTag extends Window {
  gtag?: (
    command: string,
    action: string,
    params: {
      event_category?: string;
      event_label?: string;
      [key: string]: string | number | boolean;
    },
  ) => void;
}

// Define window with Facebook Pixel
interface WindowWithFBQ extends Window {
  fbq?: (
    eventType: string,
    eventName: string,
    params: {
      content_name?: string;
      content_category?: string;
      [key: string]: string | number | boolean;
    },
  ) => void;
}

// Lead magnet info type
interface LeadMagnetInfo {
  title: string;
  description: string;
  downloadPath: string;
}

// Type definition for lead magnet form data
type LeadMagnetFormData = {
  name: string;
  email: string;
  leadMagnetType: 'tattoo-guide' | 'aftercare-checklist' | 'design-ideas';
};

// Lead magnet information
const leadMagnets: Record<string, LeadMagnetInfo> = {
  'tattoo-guide': {
    title: "First-Timer's Tattoo Guide",
    description:
      'Everything you need to know before getting your first tattoo, from choosing a design to preparing for your session.',
    downloadPath: '/downloads/first-timers-tattoo-guide.pdf',
  },
  'aftercare-checklist': {
    title: 'Tattoo Aftercare Checklist',
    description:
      'A complete day-by-day checklist to ensure your tattoo heals perfectly and looks amazing for years to come.',
    downloadPath: '/downloads/tattoo-aftercare-checklist.pdf',
  },
  'design-ideas': {
    title: '101 Tattoo Design Ideas',
    description:
      'Get inspired with this collection of unique tattoo designs across various styles, from minimal to elaborate.',
    downloadPath: '/downloads/101-tattoo-design-ideas.pdf',
  },
};

// Type for API response
interface LeadMagnetApiResponse {
  success: boolean;
  downloadUrl?: string;
  leadId?: number;
  message?: string;
  error?: string;
}

// Cookie type
interface LeadSubmittedCookie {
  email: string;
  type: string;
  date: string;
}

// Type for tracking event metadata
interface TrackingEventMetadata {
  leadMagnetType: string;
  timestamp: string;
  [key: string]: string;
}

export default function LeadMagnet() {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMagnet, setSelectedMagnet] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [cookies, setCookie] = useCookies(['ink37_lead_submitted']);

  // For tracking impressions
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Form validation and handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LeadMagnetFormData>();

  const selectedLeadMagnet = watch('leadMagnetType');

  // Track impression when section comes into view
  useEffect(() => {
    if (isInView && !hasTrackedImpression) {
      // Track the impression
      const trackImpression = async () => {
        try {
          // Get the referrer information
          const referer = document.referrer || 'direct';

          // Send impression tracking data
          await axios.put('/api/lead-magnet', {
            leadMagnetType: 'section-view', // General view before specific selection
            source: referer,
          });

          setHasTrackedImpression(true);
          console.info('Section impression tracked');
        } catch (error) {
          console.error('Error tracking impression:', error);
          // Non-critical, so we don't show error to user
        }
      };

      trackImpression();
    }
  }, [isInView, hasTrackedImpression]);

  // Track specific lead magnet view when selected
  useEffect(() => {
    if (selectedLeadMagnet) {
      // Track the specific lead magnet impression
      const trackLeadMagnetImpression = async () => {
        try {
          await axios.put('/api/lead-magnet', {
            leadMagnetType: selectedLeadMagnet,
            source: 'direct-selection',
          });

          console.info(`${selectedLeadMagnet} impression tracked`);
        } catch (error) {
          console.error('Error tracking lead magnet impression:', error);
          // Non-critical, so we don't show error to user
        }
      };

      trackLeadMagnetImpression();
    }
  }, [selectedLeadMagnet]);

  // Track download event
  const trackDownload = async () => {
    if (leadId && selectedMagnet) {
      try {
        await axios.post('/api/lead-magnet/track', {
          leadId,
          eventType: 'DOWNLOAD_CLICKED',
          metadata: {
            leadMagnetType: selectedMagnet,
            timestamp: new Date().toISOString(),
          } as TrackingEventMetadata,
        });

        console.info(`Download tracked for lead ID ${leadId}`);
      } catch (error) {
        console.error('Error tracking download:', error);
        // Non-critical, so we don't show error to user
      }
    }
  };

  // Form submission handler
  const onSubmit = async (data: LeadMagnetFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if there's a cookie indicating this email already submitted
      let submittedCookie: LeadSubmittedCookie | null = null;
      if (cookies['ink37_lead_submitted']) {
        try {
          submittedCookie = JSON.parse(cookies['ink37_lead_submitted']);
        } catch {
          submittedCookie = null;
        }
      }
      if (submittedCookie && submittedCookie.email === data.email) {
        // Used to show a "duplicate submission" message if needed
        // For now, just continue as normal but log the repeat submission
        console.info('Repeat submission detected from:', data.email);
      }

      // Send data to the API
      const response = await axios.post<LeadMagnetApiResponse>('/api/lead-magnet', data);

      // Process response
      const responseData = response.data;

      setSelectedMagnet(data.leadMagnetType);
      if (responseData.downloadUrl) {
        setDownloadUrl(responseData.downloadUrl);
      }
      if (responseData.leadId) {
        setLeadId(responseData.leadId);
      }
      setIsSuccess(true);

      // Set a cookie to remember this submission
      setCookie(
        'ink37_lead_submitted',
        {
          email: data.email,
          type: data.leadMagnetType,
          date: new Date().toISOString(),
        } as LeadSubmittedCookie,
        {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'strict',
        },
      );

      // Track form submission event
      try {
        // Track with Google Analytics
        const windowWithGTag = window as WindowWithGTag;
        if (windowWithGTag.gtag) {
          windowWithGTag.gtag('event', 'lead_magnet_conversion', {
            event_category: 'Lead Magnet',
            event_label: data.leadMagnetType,
          });
        }

        // Track with Facebook Pixel
        const windowWithFBQ = window as WindowWithFBQ;
        if (windowWithFBQ.fbq) {
          windowWithFBQ.fbq('track', 'Lead', {
            content_name: leadMagnets[data.leadMagnetType]?.title ?? data.leadMagnetType,
            content_category: 'Lead Magnet',
          });
        }
      } catch (analyticsError) {
        console.error('Error tracking analytics event:', analyticsError);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');

      // Track error event
      try {
        const windowWithGTag = window as WindowWithGTag;
        if (windowWithGTag.gtag) {
          windowWithGTag.gtag('event', 'lead_magnet_error', {
            event_category: 'Error',
            event_label: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      } catch (analyticsError) {
        console.error('Error tracking analytics event:', analyticsError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="lead-magnet"
      className="section py-24 bg-gradient-to-b from-tattoo-red to-tattoo-red-dark"
      data-section-type="lead-magnet"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {isSuccess ? (
            <motion.div
              className="bg-tattoo-black/20 backdrop-blur-sm rounded-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl text-tattoo-white mb-6">✓</div>
              <h3 className="text-2xl font-bold text-tattoo-white mb-4">Thanks for subscribing!</h3>
              <p className="text-tattoo-white/90 mb-6 max-w-md mx-auto">
                Your download is ready. I've also sent a copy to your email for future reference.
              </p>

              {selectedMagnet && downloadUrl && (
                <a
                  href={downloadUrl}
                  className="btn bg-tattoo-white text-tattoo-red hover:bg-tattoo-white/90"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackDownload}
                >
                  Download Now
                </a>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-tattoo-white mb-6">
                  Ready to Transform Your Tattoo Experience?
                </h2>
                <p className="text-lg text-tattoo-white/90 mb-6">
                  Join my community and get exclusive access to tattoo resources that will help you
                  prepare for your tattoo journey. Choose one of my free guides below.
                </p>
              </motion.div>

              <motion.div
                className="lg:col-span-3 bg-tattoo-black/20 backdrop-blur-sm rounded-lg p-6"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {error && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-md">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-tattoo-white mb-2">Name</label>
                      <input
                        type="text"
                        className={`w-full bg-tattoo-white/10 border border-tattoo-white/30 rounded-md px-4 py-3 text-tattoo-white
                          placeholder:text-tattoo-white/50 focus:outline-none focus:ring-2 focus:ring-tattoo-white
                          ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                        placeholder="Your Name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-tattoo-white mb-2">Email</label>
                      <input
                        type="email"
                        className={`w-full bg-tattoo-white/10 border border-tattoo-white/30 rounded-md px-4 py-3 text-tattoo-white
                          placeholder:text-tattoo-white/50 focus:outline-none focus:ring-2 focus:ring-tattoo-white
                          ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                        placeholder="Your Email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <label className="block text-tattoo-white mb-4">Choose Your Free Resource</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(leadMagnets).map(([type, { title, description }]) => (
                      <div key={type} className="relative">
                        <input
                          type="radio"
                          id={type}
                          value={type}
                          className="peer sr-only"
                          {...register('leadMagnetType', { required: true })}
                        />
                        <label
                          htmlFor={type}
                          className={`flex flex-col h-full p-4 rounded-lg border-2 border-tattoo-white/30 cursor-pointer transition-all
                            peer-checked:border-tattoo-white peer-checked:bg-tattoo-white/10 hover:bg-tattoo-white/5`}
                        >
                          <span
                            className={`text-lg font-semibold mb-2 ${selectedLeadMagnet === type ? 'text-tattoo-white' : 'text-tattoo-white/80'}`}
                          >
                            {title}
                          </span>
                          <span
                            className={`text-sm ${selectedLeadMagnet === type ? 'text-tattoo-white/90' : 'text-tattoo-white/70'}`}
                          >
                            {description}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.leadMagnetType && (
                    <p className="text-red-400 text-sm mb-4">Please select a resource</p>
                  )}

                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn bg-tattoo-white text-tattoo-red hover:bg-tattoo-white/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-tattoo-red"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Get My Free Resource'
                      )}
                    </button>
                    <p className="text-sm text-tattoo-white/70 mt-3">
                      I respect your privacy and will never share your information.
                    </p>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

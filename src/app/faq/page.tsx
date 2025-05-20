import React from 'react';
import { FAQAccordion } from '@/components/faq/FAQAccordion';
import FAQSearch from '@/components/faq/FAQSearch';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  HelpCircle,
  ClipboardList,
  ScrollText,
  Palette,
  ChevronRight,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export const metadata = {
  title: 'FAQ | Ink 37',
  description:
    'Find answers to common questions about tattoo services, process, and policies at Ink 37.',
};

// FAQ categories and items
const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    icon: 'help-circle',
    items: [
      {
        question: 'What are your working hours?',
        answer:
          'I work by appointment only, which allows me to provide dedicated attention to each client. This flexible scheduling means I can accommodate various time preferences based on availability.',
      },
      {
        question: 'Where are you located?',
        answer:
          "I'm based in the Houston area. The exact location details will be shared with you after your booking is confirmed. I have created a comfortable, private space that feels more like a home than a typical tattoo shop.",
      },
      {
        question: 'Do you do walk-ins?',
        answer:
          "I work exclusively by appointment to ensure I can dedicate proper time and attention to each client's unique piece. This approach allows me to prepare thoroughly for your session and create the best possible experience and result.",
      },
      {
        question: 'How far in advance should I book?',
        answer:
          'I recommend booking at least 2-4 weeks in advance for consultations. For the actual tattoo appointment, the timeline varies based on the complexity of the design and my current schedule. Popular times like evenings and weekends tend to book further in advance.',
      },
    ],
  },
  {
    id: 'process',
    title: 'Consultation & Process',
    icon: 'clipboard',
    items: [
      {
        question: 'What is the consultation process like?',
        answer:
          'My consultation process is designed to be thorough and collaborative. You will meet with me to discuss your tattoo idea, placement, size, and design elements. We will explore reference materials and talk about how to make your tattoo unique. I will provide insights on what works well for your specific idea and may sketch preliminary concepts. This is also the time to address any questions or concerns you might have before scheduling your tattoo session.',
      },
      {
        question: 'How should I prepare for my tattoo appointment?',
        answer:
          'To prepare for your appointment: 1) Stay hydrated and avoid alcohol for 24 hours before. 2) Eat a good meal before arriving. 3) Wear comfortable, appropriate clothing that allows easy access to the tattoo area. 4) Get a good nights sleep. 5) Showering before your appointment is appreciated. 6) Consider any pain management strategies (but avoid blood thinners like aspirin). 7) Bring snacks and entertainment for longer sessions.',
      },
      {
        question: 'Can I bring a friend to my appointment?',
        answer:
          'Yes, you can bring one support person to your appointment. Having someone with you can be helpful, especially for longer sessions. However, I do ask that your guest be respectful of the space and process.',
      },
      {
        question: 'How long does a tattoo session typically take?',
        answer:
          'Session length varies greatly depending on the size, complexity, and detail of your tattoo. Small pieces might take 1-2 hours, while larger or more detailed work could require multiple sessions of 3-6 hours each. During your consultation, I will provide an estimate of the time needed for your specific design.',
      },
    ],
  },
  {
    id: 'policies',
    title: 'Policies & Requirements',
    icon: 'scroll',
    items: [
      {
        question: 'How does your deposit policy work?',
        answer:
          'I require a non-refundable $50 deposit to secure your tattoo appointment. This deposit is applied toward your final tattoo cost. The deposit ensures commitment to the appointment and compensates for time spent preparing your custom design. Deposits are required before I can confirm and schedule your appointment. If you need to reschedule, please provide at least 48 hours notice, and your deposit will transfer to your new appointment date.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'I accept deposits through Cash App, Venmo, and PayPal. For final payments on the day of your appointment, I accept cash, credit/debit cards, and the same digital payment platforms used for deposits. I also offer payment plans for larger pieces that require multiple sessions.',
      },
      {
        question: 'Are there any age restrictions?',
        answer:
          "Yes, I strictly adhere to legal age requirements. All clients must be 18 years or older with valid government-issued photo ID. I do not tattoo minors even with parental consent. There is no maximum age limit, but I assess each client's skin condition to ensure it will hold ink properly. Some health conditions may affect eligibility, which I evaluate during consultation.",
      },
      {
        question: 'What is your cancellation policy?',
        answer:
          'If you need to cancel or reschedule, please provide at least 48 hours notice. This allows me time to potentially fill the slot with another client. Cancellations with less than 48 hours notice will result in loss of your deposit. No-shows automatically forfeit their deposit and may be required to pay a larger deposit for future appointments.',
      },
    ],
  },
  {
    id: 'tattoos',
    title: 'About Tattoos',
    icon: 'pen-tool',
    items: [
      {
        question: 'How do you approach pricing?',
        answer:
          'My pricing is based on several factors: size, complexity, placement, amount of detail, color vs. black and grey, and estimated time needed. I do not have fixed prices for specific designs because each tattoo is custom-created for you. After your consultation, I can provide a price range, and I will confirm the exact price before beginning work. My minimum charge is $100, and my hourly rate starts at $150, depending on the complexity.',
      },
      {
        question: 'What is your aftercare process?',
        answer:
          'After your tattoo is complete, I will clean the area and apply a protective covering. I provide detailed written aftercare instructions, but generally: Keep the bandage on for the recommended time (usually 2-24 hours depending on the type). Wash gently with unscented soap and water. Apply a thin layer of recommended aftercare product. Avoid swimming, direct sunlight, and tight clothing on the area while healing. No picking or scratching the tattoo. I recommend scheduling a follow-up appointment for any touch-ups if needed after full healing.',
      },
      {
        question: 'Do you work on cover-ups or reworks of existing tattoos?',
        answer:
          'Yes, I specialize in cover-ups and reworks. Cover-ups transform an existing tattoo into a new design, while reworks enhance or fix issues with existing tattoos. These projects require special expertise, as I work with what is already in your skin. I will evaluate your existing tattoo during consultation to determine the best approach. Cover-up tattoos typically need to be larger and darker than the original tattoo. Please bring clear photos of your existing tattoo to your consultation so I can assess it properly.',
      },
      {
        question: 'How painful is getting a tattoo?',
        answer:
          'Pain levels vary based on the location of the tattoo, your personal pain tolerance, and the style of the tattoo. Areas with thin skin over bone or near nerve endings (like ribs, feet, and inner arms) tend to be more sensitive. I work efficiently and can take breaks as needed to ensure your comfort throughout the process. Many clients describe the sensation as manageable – more discomfort than acute pain.',
      },
    ],
  },
];

// Function to render the appropriate icon
const renderIcon = (iconName: string, className: string = 'h-6 w-6') => {
  switch (iconName) {
    case 'help-circle':
      return <HelpCircle className={className} />;
    case 'clipboard':
      return <ClipboardList className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
    case 'pen-tool':
      return <Palette className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-tattoo-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative mb-16">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-tattoo-blue/10 to-transparent rounded-3xl -z-10"></div>
          <div className="absolute inset-0 bg-tattoo-black/60 backdrop-blur-sm rounded-3xl -z-10"></div>

          <div className="max-w-4xl mx-auto text-center py-16 px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 relative">
              <span className="relative inline-block">
                Frequently Asked Questions
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-tattoo-blue via-tattoo-blue to-transparent"></span>
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              Everything you need to know about the tattoo experience at Ink 37
            </p>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <FAQSearch categories={faqCategories} />
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {faqCategories.map(category => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="bg-tattoo-black/70 hover:bg-tattoo-blue/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-tattoo-blue/10 flex items-center justify-center group-hover:bg-tattoo-blue/20 transition-colors">
                    {renderIcon(category.icon, 'h-5 w-5 text-tattoo-blue')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-tattoo-blue transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-3">{category.items.length} questions</p>
                    <div className="flex items-center text-xs text-tattoo-blue">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        View questions
                      </span>
                      <ChevronRight className="h-3 w-3 ml-1 group-hover:ml-2 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Most Frequent Questions Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-tattoo-blue/20 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-tattoo-blue" />
              </div>
              <h2 className="text-2xl font-bold text-white">Most Asked Questions</h2>
            </div>

            <div className="bg-tattoo-black/70 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg">
              <FAQAccordion
                items={[
                  faqCategories[0]?.items[0],
                  faqCategories[1]?.items[0],
                  faqCategories[2]?.items[0],
                  faqCategories[3]?.items[0],
                ].filter((item): item is {question: string; answer: string} => item !== undefined)}
              />
            </div>
          </div>
        </section>

        {/* Main FAQ Categories */}
        <section className="space-y-16">
          {faqCategories.map(category => (
            <div key={category.id} id={category.id} className="scroll-mt-24 max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-full bg-tattoo-blue/10 flex items-center justify-center mr-4">
                  {renderIcon(category.icon, 'h-5 w-5 text-tattoo-blue')}
                </div>
                <h2 className="text-2xl font-bold text-white">{category.title}</h2>
              </div>

              <div className="bg-tattoo-black/70 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  {category.icon === 'pen-tool' && (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 500 500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M50,50 C150,150 250,50 350,150 C450,250 350,350 250,450"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                    </svg>
                  )}
                  {category.icon === 'help-circle' && (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 500 500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="250"
                        cy="250"
                        r="200"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="150"
                        cy="150"
                        r="50"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="350"
                        cy="350"
                        r="50"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                    </svg>
                  )}
                  {category.icon === 'clipboard' && (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 500 500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="100"
                        y="50"
                        width="300"
                        height="400"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                      <line x1="150" y1="150" x2="350" y2="150" stroke="white" strokeWidth="10" />
                      <line x1="150" y1="200" x2="350" y2="200" stroke="white" strokeWidth="10" />
                      <line x1="150" y1="250" x2="350" y2="250" stroke="white" strokeWidth="10" />
                    </svg>
                  )}
                  {category.icon === 'scroll' && (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 500 500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100,100 Q250,50 400,100 T100,200 T400,300 T100,400"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>

                <div className="relative z-10">
                  <FAQAccordion items={category.items} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="mt-20 relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-tattoo-blue/10 to-tattoo-red/10 blur-2xl rounded-xl"></div>
          <div className="relative z-10 bg-tattoo-black/80 backdrop-blur-lg rounded-xl border border-white/10 p-8 md:p-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-tattoo-blue/10 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-tattoo-blue/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-tattoo-blue" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              If you have a question that wasn't answered here, or if you need more information
              about my services, please don&apos;t hesitate to reach out.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild variant="default" size="lg" className="min-w-[180px]">
                <Link href="/booking" className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book a Consultation
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="min-w-[180px]">
                <Link href="/contact" className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Me
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqCategories.flatMap(category =>
              category.items.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            ),
          }),
        }}
      />
    </main>
  );
}

'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AftercareInstructions() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Tattoo Aftercare Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-medium">Day 1-3: Initial Care</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                <AftercareStep
                  title="Leave the bandage on for 2-4 hours"
                  description="Your artist will let you know the specific time for your tattoo"
                />
                <AftercareStep
                  title="Gently wash with unscented antibacterial soap"
                  description="Use lukewarm water, do not scrub or use a washcloth"
                />
                <AftercareStep
                  title="Apply a thin layer of recommended aftercare ointment"
                  description="We recommend using Aquaphor or the product your artist suggested"
                />
                <AftercareStep
                  title="Wash 2-3 times daily"
                  description="Keep the tattoo clean to prevent infection"
                />
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="font-medium">Day 4-14: Healing Process</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                <AftercareStep
                  title="Continue washing 2-3 times daily"
                  description="Keep using the antibacterial soap"
                />
                <AftercareStep
                  title="Switch to unscented lotion"
                  description="Apply a thin layer after washing when the skin feels dry"
                />
                <AftercareStep
                  title="Avoid direct sunlight"
                  description="Cover tattoo when going outside or use SPF 50+ if healed enough"
                />
                <AftercareStep
                  title="don't pick at peeling skin"
                  description="Let it flake off naturally to avoid color loss and scarring"
                />
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="font-medium">Long-term Care</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                <AftercareStep
                  title="Always use SPF 50+ sunscreen"
                  description="Sun exposure can fade your tattoo over time"
                />
                <AftercareStep
                  title="Keep skin moisturized"
                  description="Well-hydrated skin helps the tattoo look its best"
                />
                <AftercareStep
                  title="Schedule touch-ups if needed"
                  description="We offer touch-ups within 3 months of your tattoo"
                />
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-700">Important Warnings</h4>
              <ul className="mt-2 ml-6 list-disc text-red-700 text-sm space-y-1">
                <li>Avoid swimming, saunas, baths, and hot tubs for at least 2 weeks</li>
                <li>No sun exposure or tanning beds until fully healed (2-4 weeks)</li>
                <li>Avoid tight clothing over the tattoo during healing</li>
                <li>don&apos;t scratch or pick at your tattoo even if it itches</li>
                <li>
                  Contact your doctor if you notice unusual redness, swelling, warmth, or discharge
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for each aftercare step
function AftercareStep({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-start">
      <div className="mr-3 mt-1">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </li>
  );
}

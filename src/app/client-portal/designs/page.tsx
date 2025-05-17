'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Paintbrush,
  Plus,
  SlidersHorizontal,
  Clock,
  XCircle,
  CheckCircle,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { TattooDesignViewer } from '@/app/client-portal/components//TattooDesignViewer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TattooDesign {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
  status: string;
  isApproved: boolean;
  revisionCount: number;
  artist: {
    name: string;
    avatarUrl?: string;
  };
}

export default function ClientDesignsPage() {
  const [designs, setDesigns] = useState<TattooDesign[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<TattooDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch designs from API
  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = '/client/login';
          return;
        }

        // Get customer ID by email
        const { data: customerData, error: customerError } = await supabase
          .from('Customer')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (customerError || !customerData) {
          console.error('Error fetching customer data:', customerError);
          setLoading(false);
          return;
        }

        // Fetch designs
        const { data: designsData, error: designsError } = await supabase
          .from('TattooDesign')
          .select(
            `
            id,
            name,
            description,
            fileUrl,
            designType,
            isApproved,
            approvedAt,
            createdAt,
            updatedAt,
            artist:artistId (
              user:userId (
                name
              )
            )
          `,
          )
          .eq('customerId', customerData.id)
          .order('createdAt', { ascending: false });

        if (designsError) {
          console.error('Error fetching designs:', designsError);
        } else if (designsData) {
          // Transform data to match component interface
          const transformedDesigns: TattooDesign[] = designsData.map(design => ({
            id: design.id,
            title: design.name,
            description: design.description || undefined,
            imageUrl: design.fileUrl,
            createdAt: design.createdAt,
            isApproved: design.isApproved,
            // Determine status based on available fields
            status: design.isApproved
              ? 'approved'
              : design.approvedAt
                ? 'final'
                : design.updatedAt !== design.createdAt
                  ? 'pending_review'
                  : 'draft',
            revisionCount: design.updatedAt !== design.createdAt ? 1 : 0,
            artist: {
              name: design.artist?.user?.name || 'Unknown Artist',
            },
          }));

          setDesigns(transformedDesigns);
          updateFilteredDesigns(transformedDesigns, activeTab, statusFilter);
        }
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Filter designs based on tab and status filter
  const updateFilteredDesigns = (allDesigns: TattooDesign[], tab: string, status: string) => {
    let filtered = [...allDesigns];

    // First apply tab filter
    if (tab !== 'all') {
      if (tab === 'pending') {
        filtered = filtered.filter(
          design => design.status === 'pending_review' || design.status === 'draft',
        );
      } else if (tab === 'approved') {
        filtered = filtered.filter(
          design => design.status === 'approved' || design.status === 'final',
        );
      } else if (tab === 'rejected') {
        filtered = filtered.filter(design => design.status === 'rejected');
      }
    }

    // Then apply status filter if it's not 'all'
    if (status !== 'all') {
      filtered = filtered.filter(design => design.status === status);
    }

    setFilteredDesigns(filtered);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateFilteredDesigns(designs, value, statusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    updateFilteredDesigns(designs, activeTab, value);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Skeleton className="h-10 w-full" />

        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          <Paintbrush className="h-6 w-6 mr-2 text-red-500" />
          <h1 className="text-3xl font-bold">My Tattoo Designs</h1>
        </motion.div>

        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Request New Design
        </Button>
      </div>

      {designs.length === 0 ? (
        <div className="border rounded-lg p-8 text-center bg-gray-50">
          <Paintbrush className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Designs Yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You don&apos;t have any tattoo designs yet. Book a consultation to start working with an
            artist on your custom tattoo.
          </p>
          <Button>Book a Consultation</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">
                  All Designs
                  <Badge variant="secondary" className="ml-2 bg-gray-100">
                    {designs.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                    {
                      designs.filter(d => d.status === 'pending_review' || d.status === 'draft')
                        .length
                    }
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                    {designs.filter(d => d.status === 'approved' || d.status === 'final').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected
                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                    {designs.filter(d => d.status === 'rejected').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="pending_review">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Pending Review
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Approved
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Needs Changes
                    </div>
                  </SelectItem>
                  <SelectItem value="final">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                      Final Design
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Design list */}
          <div className="space-y-8">
            {filteredDesigns.length === 0 ? (
              <div className="border rounded-lg p-8 text-center bg-gray-50">
                <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-lg font-medium mb-2">No designs match your filters</h2>
                <p className="text-gray-500 mb-4">
                  Try changing your filter settings to see more designs.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab('all');
                    setStatusFilter('all');
                    updateFilteredDesigns(designs, 'all', 'all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredDesigns.map(design => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <TattooDesignViewer design={design} />
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

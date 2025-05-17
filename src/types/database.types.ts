export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Analytics: {
        Row: {
          createdAt: string
          date: string
          id: string
          metrics: Json
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          date: string
          id?: string
          metrics: Json
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          date?: string
          id?: string
          metrics?: Json
          updatedAt?: string
        }
        Relationships: []
      }
      AnalyticsEvent: {
        Row: {
          category: string
          createdAt: string
          data: Json
          eventId: string
          id: string
          name: string
          session_id: string | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          category: string
          createdAt?: string
          data: Json
          eventId: string
          id?: string
          name: string
          session_id?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          category?: string
          createdAt?: string
          data?: Json
          eventId?: string
          id?: string
          name?: string
          session_id?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AnalyticsEvent_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Appointment: {
        Row: {
          artistId: string
          cancellationReason: string | null
          colorPalette: string[] | null
          createdAt: string
          customerId: string
          date: string
          depositAmount: number | null
          depositPaid: boolean
          designId: string | null
          duration: number
          endTime: string
          id: string
          isConsultation: boolean
          isPrepaidDeposit: boolean
          notes: string | null
          placement: string
          preparationNotes: string | null
          references: string[] | null
          size: string
          startTime: string
          status: string
          updatedAt: string
        }
        Insert: {
          artistId: string
          cancellationReason?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerId: string
          date: string
          depositAmount?: number | null
          depositPaid?: boolean
          designId?: string | null
          duration: number
          endTime: string
          id?: string
          isConsultation?: boolean
          isPrepaidDeposit?: boolean
          notes?: string | null
          placement: string
          preparationNotes?: string | null
          references?: string[] | null
          size: string
          startTime: string
          status?: string
          updatedAt?: string
        }
        Update: {
          artistId?: string
          cancellationReason?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerId?: string
          date?: string
          depositAmount?: number | null
          depositPaid?: boolean
          designId?: string | null
          duration?: number
          endTime?: string
          id?: string
          isConsultation?: boolean
          isPrepaidDeposit?: boolean
          notes?: string | null
          placement?: string
          preparationNotes?: string | null
          references?: string[] | null
          size?: string
          startTime?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Appointment_artistId_fkey"
            columns: ["artistId"]
            referencedRelation: "Artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Appointment_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Appointment_designId_fkey"
            columns: ["designId"]
            referencedRelation: "TattooDesign"
            referencedColumns: ["id"]
          }
        ]
      }
      Artist: {
        Row: {
          bio: string | null
          createdAt: string
          email: string
          id: string
          isActive: boolean
          name: string
          phone: string | null
          portfolioImages: string[] | null
          profileImage: string | null
          rate: number | null
          specialties: string[] | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          bio?: string | null
          createdAt?: string
          email: string
          id?: string
          isActive?: boolean
          name: string
          phone?: string | null
          portfolioImages?: string[] | null
          profileImage?: string | null
          rate?: number | null
          specialties?: string[] | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          bio?: string | null
          createdAt?: string
          email?: string
          id?: string
          isActive?: boolean
          name?: string
          phone?: string | null
          portfolioImages?: string[] | null
          profileImage?: string | null
          rate?: number | null
          specialties?: string[] | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Artist_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Booking: {
        Row: {
          appointmentId: string | null
          colorPalette: string[] | null
          createdAt: string
          customerEmail: string
          customerName: string
          customerPhone: string | null
          date: string | null
          description: string
          id: string
          isFirstTattoo: boolean
          placement: string
          preferredArtistId: string | null
          references: string[] | null
          size: string
          status: string
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerEmail: string
          customerName: string
          customerPhone?: string | null
          date?: string | null
          description: string
          id?: string
          isFirstTattoo?: boolean
          placement: string
          preferredArtistId?: string | null
          references?: string[] | null
          size: string
          status?: string
          updatedAt?: string
        }
        Update: {
          appointmentId?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerEmail?: string
          customerName?: string
          customerPhone?: string | null
          date?: string | null
          description?: string
          id?: string
          isFirstTattoo?: boolean
          placement?: string
          preferredArtistId?: string | null
          references?: string[] | null
          size?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Booking_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Booking_preferredArtistId_fkey"
            columns: ["preferredArtistId"]
            referencedRelation: "Artist"
            referencedColumns: ["id"]
          }
        ]
      }
      Contact: {
        Row: {
          convertedToCustomer: boolean
          createdAt: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          referralSource: string | null
          status: string
          subject: string | null
          updatedAt: string
        }
        Insert: {
          convertedToCustomer?: boolean
          createdAt?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          referralSource?: string | null
          status?: string
          subject?: string | null
          updatedAt?: string
        }
        Update: {
          convertedToCustomer?: boolean
          createdAt?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          referralSource?: string | null
          status?: string
          subject?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      Customer: {
        Row: {
          createdAt: string
          customerSource: string | null
          dateOfBirth: string | null
          email: string
          id: string
          isMinor: boolean
          name: string
          notes: string | null
          phone: string | null
          profileImage: string | null
          tattooHistory: Json | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          customerSource?: string | null
          dateOfBirth?: string | null
          email: string
          id?: string
          isMinor?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          profileImage?: string | null
          tattooHistory?: Json | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          customerSource?: string | null
          dateOfBirth?: string | null
          email?: string
          id?: string
          isMinor?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          profileImage?: string | null
          tattooHistory?: Json | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Customer_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Interaction: {
        Row: {
          appointmentId: string | null
          channel: string
          content: string
          createdAt: string
          customerId: string
          id: string
          interactionType: string
          staffId: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          channel: string
          content: string
          createdAt?: string
          customerId: string
          id?: string
          interactionType: string
          staffId?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          appointmentId?: string | null
          channel?: string
          content?: string
          createdAt?: string
          customerId?: string
          id?: string
          interactionType?: string
          staffId?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Interaction_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Interaction_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Lead: {
        Row: {
          convertedToCustomer: boolean
          createdAt: string
          email: string
          id: string
          leadMagnet: string | null
          leadSource: string | null
          name: string | null
          phone: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          convertedToCustomer?: boolean
          createdAt?: string
          email: string
          id?: string
          leadMagnet?: string | null
          leadSource?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          convertedToCustomer?: boolean
          createdAt?: string
          email?: string
          id?: string
          leadMagnet?: string | null
          leadSource?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Note: {
        Row: {
          appointmentId: string | null
          content: string
          createdAt: string
          createdBy: string | null
          customerId: string | null
          id: string
          noteType: string
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          content: string
          createdAt?: string
          createdBy?: string | null
          customerId?: string | null
          id?: string
          noteType: string
          updatedAt?: string
        }
        Update: {
          appointmentId?: string | null
          content?: string
          createdAt?: string
          createdBy?: string | null
          customerId?: string | null
          id?: string
          noteType?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Note_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Note_createdBy_fkey"
            columns: ["createdBy"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Note_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      NotificationQueue: {
        Row: {
          channel: string
          content: Json
          createdAt: string
          id: string
          processedAt: string | null
          recipient: string
          status: string
          type: string
          updatedAt: string
        }
        Insert: {
          channel: string
          content: Json
          createdAt?: string
          id?: string
          processedAt?: string | null
          recipient: string
          status?: string
          type: string
          updatedAt?: string
        }
        Update: {
          channel?: string
          content?: Json
          createdAt?: string
          id?: string
          processedAt?: string | null
          recipient?: string
          status?: string
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Payment: {
        Row: {
          amount: number
          appointmentId: string | null
          createdAt: string
          customerId: string
          date: string
          id: string
          method: string
          notes: string | null
          paymentIntentId: string | null
          paymentType: string
          receiptUrl: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          amount: number
          appointmentId?: string | null
          createdAt?: string
          customerId: string
          date: string
          id?: string
          method: string
          notes?: string | null
          paymentIntentId?: string | null
          paymentType: string
          receiptUrl?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          amount?: number
          appointmentId?: string | null
          createdAt?: string
          customerId?: string
          date?: string
          id?: string
          method?: string
          notes?: string | null
          paymentIntentId?: string | null
          paymentType?: string
          receiptUrl?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Service: {
        Row: {
          basePrice: number | null
          category: string | null
          createdAt: string
          description: string | null
          id: string
          isActive: boolean
          name: string
          updatedAt: string
        }
        Insert: {
          basePrice?: number | null
          category?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          isActive?: boolean
          name: string
          updatedAt?: string
        }
        Update: {
          basePrice?: number | null
          category?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          isActive?: boolean
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Session: {
        Row: {
          createdAt: string
          data: Json
          expiresAt: string | null
          id: string
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          data: Json
          expiresAt?: string | null
          id?: string
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          data?: Json
          expiresAt?: string | null
          id?: string
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Tag: {
        Row: {
          createdAt: string
          id: string
          name: string
          tagType: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          tagType: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          tagType?: string
          updatedAt?: string
        }
        Relationships: []
      }
      TaggedEntity: {
        Row: {
          createdAt: string
          entityId: string
          entityType: string
          id: string
          tagId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          entityId: string
          entityType: string
          id?: string
          tagId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          entityId?: string
          entityType?: string
          id?: string
          tagId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "TaggedEntity_tagId_fkey"
            columns: ["tagId"]
            referencedRelation: "Tag"
            referencedColumns: ["id"]
          }
        ]
      }
      TattooDesign: {
        Row: {
          artistId: string | null
          createdAt: string
          customerId: string
          description: string | null
          designFiles: string[]
          id: string
          isApproved: boolean
          name: string
          placementArea: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          artistId?: string | null
          createdAt?: string
          customerId: string
          description?: string | null
          designFiles: string[]
          id?: string
          isApproved?: boolean
          name: string
          placementArea?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          artistId?: string | null
          createdAt?: string
          customerId?: string
          description?: string | null
          designFiles?: string[]
          id?: string
          isApproved?: boolean
          name?: string
          placementArea?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "TattooDesign_artistId_fkey"
            columns: ["artistId"]
            referencedRelation: "Artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TattooDesign_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Testimonial: {
        Row: {
          approved: boolean
          content: string
          createdAt: string
          customerId: string | null
          displayName: string
          email: string | null
          id: string
          rating: number
          tattooType: string | null
          updatedAt: string
        }
        Insert: {
          approved?: boolean
          content: string
          createdAt?: string
          customerId?: string | null
          displayName: string
          email?: string | null
          id?: string
          rating: number
          tattooType?: string | null
          updatedAt?: string
        }
        Update: {
          approved?: boolean
          content?: string
          createdAt?: string
          customerId?: string | null
          displayName?: string
          email?: string | null
          id?: string
          rating?: number
          tattooType?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Testimonial_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Transaction: {
        Row: {
          amount: number
          createdAt: string
          date: string
          description: string | null
          id: string
          paymentId: string | null
          transactionType: string
          updatedAt: string
        }
        Insert: {
          amount: number
          createdAt?: string
          date: string
          description?: string | null
          id?: string
          paymentId?: string | null
          transactionType: string
          updatedAt?: string
        }
        Update: {
          amount?: number
          createdAt?: string
          date?: string
          description?: string | null
          id?: string
          paymentId?: string | null
          transactionType?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transaction_paymentId_fkey"
            columns: ["paymentId"]
            referencedRelation: "Payment"
            referencedColumns: ["id"]
          }
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          lastLoginAt: string | null
          metadata: Json | null
          phoneNumber: string | null
          role: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          lastLoginAt?: string | null
          metadata?: Json | null
          phoneNumber?: string | null
          role?: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          lastLoginAt?: string | null
          metadata?: Json | null
          phoneNumber?: string | null
          role?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
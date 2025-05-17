
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Parse request with optional parameters for selective cleanup
    const requestData = req.method === 'POST' ? await req.json() : {}
    const options = {
      cleanupNotifications: requestData.cleanupNotifications ?? true,
      cleanupOldBookings: requestData.cleanupOldBookings ?? true,
      cleanupTemporaryFiles: requestData.cleanupTemporaryFiles ?? true,
      cleanupLogs: requestData.cleanupLogs ?? true,
      dryRun: requestData.dryRun ?? false
    }
    
    // Perform cleanup operations
    const results = await performCleanupTasks(supabaseClient, options)
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Define options interface
interface CleanupOptions {
  cleanupNotifications: boolean;
  cleanupOldBookings: boolean;
  cleanupTemporaryFiles: boolean;
  cleanupLogs: boolean;
  dryRun: boolean;
}

// Function to perform cleanup tasks
async function performCleanupTasks(supabase: ReturnType<typeof createClient>, options: CleanupOptions) {
  const results = {}
  
  // Clean up old notifications
  if (options.cleanupNotifications) {
    try {
      const { count: notificationCount } = options.dryRun
        ? await supabase
            .from('Notification')
            .select('id', { count: 'exact', head: true })
            .eq('read', true)
            .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        : await supabase
            .from('Notification')
            .delete()
            .eq('read', true)
            .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      
      results['notifications'] = {
        success: true,
        cleaned: options.dryRun ? 0 : notificationCount,
        would_clean: options.dryRun ? notificationCount : 0
      }
    } catch (error) {
      console.error('Error cleaning notifications:', error)
      results['notifications'] = { success: false, error: error.message }
    }
  }
  
  // Clean up old bookings
  if (options.cleanupOldBookings) {
    try {
      const { count: bookingsCount } = options.dryRun
        ? await supabase
            .from('Booking')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        : await supabase
            .from('Booking')
            .delete()
            .eq('status', 'cancelled')
            .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      
      results['old_bookings'] = {
        success: true,
        cleaned: options.dryRun ? 0 : bookingsCount,
        would_clean: options.dryRun ? bookingsCount : 0
      }
    } catch (error) {
      console.error('Error cleaning old bookings:', error)
      results['old_bookings'] = { success: false, error: error.message }
    }
  }
  
  // Clean up temporary files
  if (options.cleanupTemporaryFiles) {
    try {
      // List objects older than 7 days in temporary bucket
      const { data: tempFiles, error: listError } = await supabase
        .storage
        .from('temp')
        .list('', {
          limit: 1000,
          offset: 0,
        })
      
      if (listError) throw listError
      
      const now = new Date()
      const filesToDelete = tempFiles.filter(file => {
        const fileDate = new Date(file.created_at)
        const diffDays = (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays > 7
      })
      
      const filePaths = filesToDelete.map(file => file.name)
      
      if (!options.dryRun && filePaths.length > 0) {
        await supabase
          .storage
          .from('temp')
          .remove(filePaths)
      }
      
      results['temporary_files'] = {
        success: true,
        cleaned: options.dryRun ? 0 : filePaths.length,
        would_clean: options.dryRun ? filePaths.length : 0
      }
    } catch (error) {
      console.error('Error cleaning temporary files:', error)
      results['temporary_files'] = { success: false, error: error.message }
    }
  }
  
  // Clean up logs
  if (options.cleanupLogs) {
    try {
      const { count: logsCount } = options.dryRun
        ? await supabase
            .from('ErrorLog')
            .select('id', { count: 'exact', head: true })
            .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        : await supabase
            .from('ErrorLog')
            .delete()
            .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      
      results['error_logs'] = {
        success: true,
        cleaned: options.dryRun ? 0 : logsCount,
        would_clean: options.dryRun ? logsCount : 0
      }
    } catch (error) {
      console.error('Error cleaning logs:', error)
      results['error_logs'] = { success: false, error: error.message }
    }
  }
  
  return results
}

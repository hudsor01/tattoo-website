'use client'

import { useState, useEffect } from 'react'
import { Save, User, Shield, Bell, Database, Globe, Mail, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GeneralSettingsForm,
  BookingSettingsForm,
  EmailSettingsForm,
  SecuritySettingsForm,
  NotificationSettingsForm,
  SettingsMutationError
} from '@/types/settings-types'

export default function SettingsPageContent() {
  // Get settings data from tRPC
  const { data: settings, isLoading, refetch } = trpc.settings.getSettings.useQuery()

  // Local state for form data
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsForm>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    businessHours: '',
    timezone: ''
  })

  const [bookingSettings, setBookingSettings] = useState<BookingSettingsForm>({
    bookingEnabled: true,
    requireDeposit: true,
    depositAmount: 100,
    maxAdvanceBookingDays: 90,
    minAdvanceBookingHours: 24,
    cancellationHours: 24,
    autoConfirmBookings: false,
    sendReminderEmails: true,
    reminderHoursBefore: 24
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettingsForm>({
    emailProvider: 'resend',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    sendWelcomeEmails: true,
    sendBookingConfirmations: true,
    sendPaymentConfirmations: true,
    sendCancellationNotices: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsForm>({
    requireTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireStrongPasswords: true,
    allowApiAccess: true,
    logSecurityEvents: true
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsForm>({
    newBookingAlerts: true,
    paymentAlerts: true,
    cancellationAlerts: true,
    systemMaintenanceAlerts: true,
    errorAlerts: true,
    weeklyReports: true,
    monthlyReports: true
  })

  // Update local state when settings data loads
  useEffect(() => {
  if (settings) {
  if (settings.general && typeof settings.general === 'object' && settings.general !== null) {
  setGeneralSettings(prev => ({ ...prev, ...settings.general as Record<string, unknown> }))
  }
  if (settings.booking && typeof settings.booking === 'object' && settings.booking !== null) {
  setBookingSettings(prev => ({ ...prev, ...settings.booking as Record<string, unknown> }))
  }
  if (settings.email && typeof settings.email === 'object' && settings.email !== null) {
  setEmailSettings(prev => ({ ...prev, ...settings.email as Record<string, unknown> }))
  }
  if (settings.security && typeof settings.security === 'object' && settings.security !== null) {
  setSecuritySettings(prev => ({ ...prev, ...settings.security as Record<string, unknown> }))
  }
  if (settings.notifications && typeof settings.notifications === 'object' && settings.notifications !== null) {
  setNotificationSettings(prev => ({ ...prev, ...settings.notifications as Record<string, unknown> }))
  }
  }
  }, [settings])

  // Mutations  
  const updateGeneralMutation = trpc.settings.updateGeneralSettings.useMutation({
    onSuccess: () => {
      toast({ title: 'General settings saved successfully' })
      void refetch()
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error saving general settings', description: error.message, variant: 'destructive' })
    }
  })

  const updateBookingMutation = trpc.settings.updateBookingSettings.useMutation({
    onSuccess: () => {
      toast({ title: 'Booking settings saved successfully' })
      void refetch()
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error saving booking settings', description: error.message, variant: 'destructive' })
    }
  })

  const updateEmailMutation = trpc.settings.updateEmailSettings.useMutation({
    onSuccess: () => {
      toast({ title: 'Email settings saved successfully' })
      void refetch()
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error saving email settings', description: error.message, variant: 'destructive' })
    }
  })

  const updateSecurityMutation = trpc.settings.updateSecuritySettings.useMutation({
    onSuccess: () => {
      toast({ title: 'Security settings saved successfully' })
      void refetch()
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error saving security settings', description: error.message, variant: 'destructive' })
    }
  })

  const updateNotificationsMutation = trpc.settings.updateNotificationSettings.useMutation({
    onSuccess: () => {
      toast({ title: 'Notification settings saved successfully' })
      void refetch()
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error saving notification settings', description: error.message, variant: 'destructive' })
    }
  })

  const sendTestEmailMutation = trpc.settings.sendTestEmail.useMutation({
    onSuccess: () => {
      toast({ title: 'Test email sent successfully' })
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error sending test email', description: error.message, variant: 'destructive' })
    }
  })

  const backupDatabaseMutation = trpc.settings.backupDatabase.useMutation({
    onSuccess: () => {
      toast({ title: 'Database backup initiated' })
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error creating backup', description: error.message, variant: 'destructive' })
    }
  })

  const clearCacheMutation = trpc.settings.clearCache.useMutation({
    onSuccess: () => {
      toast({ title: 'Cache cleared successfully' })
    },
    onError: (error: SettingsMutationError) => {
      toast({ title: 'Error clearing cache', description: error.message, variant: 'destructive' })
    }
  })

  // Handler functions
  const handleSaveGeneral = () => {
    void updateGeneralMutation.mutate(generalSettings)
  }

  const handleSaveBooking = () => {
    void updateBookingMutation.mutate(bookingSettings)
  }

  const handleSaveEmail = () => {
    void updateEmailMutation.mutate(emailSettings)
  }

  const handleSaveSecurity = () => {
    void updateSecurityMutation.mutate(securitySettings)
  }

  const handleSaveNotifications = () => {
    void updateNotificationsMutation.mutate(notificationSettings)
  }

  const handleTestEmail = () => {
    void sendTestEmailMutation.mutate({ email: emailSettings.replyToEmail })
  }

  const handleBackupDatabase = () => {
    void backupDatabaseMutation.mutate()
  }

  const handleClearCache = () => {
    void clearCacheMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => `settings-card-${i}`).map((key) => (
            <Card key={key}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  value={generalSettings.businessHours}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, businessHours: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveGeneral} disabled={updateGeneralMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateGeneralMutation.isPending ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Booking Configuration
                <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Connected to Cal.com</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Online Booking</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to book appointments online via Cal.com</p>
                </div>
                <Switch
                  checked={bookingSettings.bookingEnabled}
                  onCheckedChange={(checked) => setBookingSettings({ ...bookingSettings, bookingEnabled: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Deposit</Label>
                  <p className="text-sm text-muted-foreground">Require a deposit for new bookings</p>
                </div>
                <Switch
                  checked={bookingSettings.requireDeposit}
                  onCheckedChange={(checked) => setBookingSettings({ ...bookingSettings, requireDeposit: checked })}
                />
              </div>
              {bookingSettings.requireDeposit && (
                <div>
                  <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={bookingSettings.depositAmount}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, depositAmount: Number(e.target.value) })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxAdvanceBookingDays">Max Advance Booking (days)</Label>
                  <Input
                    id="maxAdvanceBookingDays"
                    type="number"
                    value={bookingSettings.maxAdvanceBookingDays}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, maxAdvanceBookingDays: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="minAdvanceBookingHours">Min Advance Booking (hours)</Label>
                  <Input
                    id="minAdvanceBookingHours"
                    type="number"
                    value={bookingSettings.minAdvanceBookingHours}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, minAdvanceBookingHours: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cancellationHours">Cancellation Notice (hours)</Label>
                <Input
                  id="cancellationHours"
                  type="number"
                  value={bookingSettings.cancellationHours}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationHours: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-confirm Bookings</Label>
                  <p className="text-sm text-muted-foreground">Automatically confirm new bookings from Cal.com</p>
                </div>
                <Switch
                  checked={bookingSettings.autoConfirmBookings}
                  onCheckedChange={(checked) => setBookingSettings({ ...bookingSettings, autoConfirmBookings: checked })}
                />
              </div>
              <Button onClick={handleSaveBooking} disabled={updateBookingMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateBookingMutation.isPending ? 'Saving...' : 'Save Booking Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Configuration
                <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Resend Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="replyToEmail">Reply-To Email</Label>
                  <Input
                    id="replyToEmail"
                    type="email"
                    value={emailSettings.replyToEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <Select value={emailSettings.emailProvider} onValueChange={(value) => setEmailSettings({ ...emailSettings, emailProvider: value as 'resend' | 'sendgrid' | 'smtp' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Email Notifications</h4>
                {[
                  { key: 'sendWelcomeEmails', label: 'Welcome Emails', description: 'Send welcome emails to new users' },
                  { key: 'sendBookingConfirmations', label: 'Booking Confirmations', description: 'Send confirmation emails for new bookings' },
                  { key: 'sendPaymentConfirmations', label: 'Payment Confirmations', description: 'Send confirmation emails for payments' },
                  { key: 'sendCancellationNotices', label: 'Cancellation Notices', description: 'Send emails when bookings are cancelled' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={emailSettings[setting.key as keyof typeof emailSettings] as boolean}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, [setting.key]: checked })}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEmail} disabled={updateEmailMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateEmailMutation.isPending ? 'Saving...' : 'Save Email Settings'}
                </Button>
                <Button variant="outline" onClick={handleTestEmail} disabled={sendTestEmailMutation.isPending}>
                  {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Configuration
                <span className="ml-2 text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Clerk Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts via Clerk</p>
                </div>
                <Switch
                  checked={securitySettings.requireTwoFactor}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireTwoFactor: checked })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-3">
                {[
                  { key: 'requireStrongPasswords', label: 'Require Strong Passwords', description: 'Enforce password complexity requirements via Clerk' },
                  { key: 'allowApiAccess', label: 'Allow API Access', description: 'Enable API access for integrations' },
                  { key: 'logSecurityEvents', label: 'Log Security Events', description: 'Log authentication and security events' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={securitySettings[setting.key as keyof typeof securitySettings] as boolean}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, [setting.key]: checked })}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSecurity} disabled={updateSecurityMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSecurityMutation.isPending ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Real-time Alerts</h4>
                {[
                  { key: 'newBookingAlerts', label: 'New Booking Alerts', description: 'Get notified when new bookings are created via Cal.com or website' },
                  { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Get notified about payment status changes' },
                  { key: 'cancellationAlerts', label: 'Cancellation Alerts', description: 'Get notified when bookings are cancelled' },
                  { key: 'systemMaintenanceAlerts', label: 'System Maintenance', description: 'Get notified about system maintenance' },
                  { key: 'errorAlerts', label: 'Error Alerts', description: 'Get notified about system errors' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [setting.key]: checked })}
                    />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Periodic Reports</h4>
                {[
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly business reports via email' },
                  { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly business reports via email' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [setting.key]: checked })}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveNotifications} disabled={updateNotificationsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateNotificationsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* System Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                System Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBackupDatabase} disabled={backupDatabaseMutation.isPending}>
                  <Database className="w-4 h-4 mr-2" />
                  {backupDatabaseMutation.isPending ? 'Creating Backup...' : 'Backup Database'}
                </Button>
                <Button variant="outline" onClick={handleClearCache} disabled={clearCacheMutation.isPending}>
                  <Palette className="w-4 h-4 mr-2" />
                  {clearCacheMutation.isPending ? 'Clearing...' : 'Clear Cache'}
                </Button>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Connected Integrations:</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• Cal.com - Appointment scheduling</li>
                  <li>• Resend - Email delivery</li>
                  <li>• Clerk - Authentication & user management</li>
                  <li>• Supabase - Database & file storage</li>
                  <li>• Prisma - Database ORM</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Regular maintenance helps keep your system running smoothly. Changes to these settings will impact the actual business operations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
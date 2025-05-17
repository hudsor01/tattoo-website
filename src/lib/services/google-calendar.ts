import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { CalendarAppointment, CalendarSyncAction } from '@/types/service-types';

// Initialize Google Calendar API
const initGoogleCalendar = () => {
  // Check if credentials are available
  if (
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY ||
    !process.env.GOOGLE_CALENDAR_ID
  ) {
    throw new Error('Google Calendar credentials are not configured');
  }

  // Create a JWT auth client
  const auth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  // Create Google Calendar client
  return google.calendar({ version: 'v3', auth });
};

// Get the calendar ID from environment
const getCalendarId = () => {
  return process.env.GOOGLE_CALENDAR_ID || '';
};

// Get timezone from environment variable or use default
const getTimezone = () => {
  return process.env.TIMEZONE || 'America/Chicago';
};

/**
 * Create a Google Calendar event from an appointment
 */
export const createCalendarEvent = async (appointment: CalendarAppointment): Promise<string> => {
  try {
    const calendar = initGoogleCalendar();
    const calendarId = getCalendarId();

    // Create event resource
    const event: calendar_v3.Schema$Event = {
      summary: appointment.title,
      description: appointment.description || '',
      start: {
        dateTime: new Date(appointment.start_time).toISOString(),
        timeZone: getTimezone(),
      },
      end: {
        dateTime: new Date(appointment.end_time).toISOString(),
        timeZone: getTimezone(),
      },
      // Add extended properties to link back to our appointment
      extendedProperties: {
        private: {
          appointmentId: appointment.id,
          clientId: appointment.client_id,
          depositPaid: appointment.deposit_paid ? 'true' : 'false',
        },
      },
    };

    // Add client information if available
    if (appointment.client_name) {
      event.description = `Client: ${appointment.client_name}\n\n${event.description}`;
    }

    // Add status to the event
    switch (appointment.status) {
      case 'confirmed':
        event.status = 'confirmed';
        break;
      case 'cancelled':
        event.status = 'cancelled';
        break;
      default:
        event.status = 'tentative';
    }

    // Create the event
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return response.data.id || '';
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Update a Google Calendar event for an appointment
 */
export const updateCalendarEvent = async (appointment: CalendarAppointment, eventId: string): Promise<void> => {
  try {
    const calendar = initGoogleCalendar();
    const calendarId = getCalendarId();

    // Create updated event resource
    const event: calendar_v3.Schema$Event = {
      summary: appointment.title,
      description: appointment.description || '',
      start: {
        dateTime: new Date(appointment.start_time).toISOString(),
        timeZone: getTimezone(),
      },
      end: {
        dateTime: new Date(appointment.end_time).toISOString(),
        timeZone: getTimezone(),
      },
      // Update extended properties
      extendedProperties: {
        private: {
          appointmentId: appointment.id,
          clientId: appointment.client_id,
          depositPaid: appointment.deposit_paid ? 'true' : 'false',
        },
      },
    };

    // Add client information if available
    if (appointment.client_name) {
      event.description = `Client: ${appointment.client_name}\n\n${event.description}`;
    }

    // Add status to the event
    switch (appointment.status) {
      case 'confirmed':
        event.status = 'confirmed';
        break;
      case 'cancelled':
        event.status = 'cancelled';
        break;
      default:
        event.status = 'tentative';
    }

    // Update the event
    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

/**
 * Delete a Google Calendar event
 */
export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  try {
    const calendar = initGoogleCalendar();
    const calendarId = getCalendarId();

    // Delete the event
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

/**
 * Get all events from Google Calendar
 */
export const getCalendarEvents = async (
  timeMin?: Date,
  timeMax?: Date
): Promise<calendar_v3.Schema$Event[]> => {
  try {
    const calendar = initGoogleCalendar();
    const calendarId = getCalendarId();

    // Set default time range if not provided
    const now = new Date();
    const defaultTimeMin = new Date(now);
    defaultTimeMin.setMonth(now.getMonth() - 1); // One month ago
    const defaultTimeMax = new Date(now);
    defaultTimeMax.setMonth(now.getMonth() + 3); // Three months ahead

    // Get events
    const response = await calendar.events.list({
      calendarId,
      timeMin: (timeMin || defaultTimeMin).toISOString(),
      timeMax: (timeMax || defaultTimeMax).toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

/**
 * Find an appointment's corresponding Google Calendar event
 */
export const findCalendarEventForAppointment = async (
  appointmentId: string
): Promise<string | null> => {
  try {
    const calendar = initGoogleCalendar();
    const calendarId = getCalendarId();

    // Set a broad time range to ensure we find the event
    const now = new Date();
    const timeMin = new Date(now);
    timeMin.setFullYear(now.getFullYear() - 1); // One year ago
    const timeMax = new Date(now);
    timeMax.setFullYear(now.getFullYear() + 1); // One year ahead

    // List events with a filter for the appointment ID in extended properties
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 10,
      singleEvents: true,
      privateExtendedProperty: [`appointmentId=${appointmentId}`],
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id || null;
    }

    return null;
  } catch (error) {
    console.error('Error finding calendar event for appointment:', error);
    return null;
  }
};

/**
 * Sync an appointment with Google Calendar
 * This will create, update, or delete the corresponding event
 */
export const syncAppointmentWithCalendar = async (
  appointment: CalendarAppointment,
  action: CalendarSyncAction
): Promise<void> => {
  try {
    // Handle deletion
    if (action === 'delete') {
      const eventId = await findCalendarEventForAppointment(appointment.id);
      if (eventId) {
        await deleteCalendarEvent(eventId);
      }
      return;
    }

    // For create or update, check if the event already exists
    const existingEventId = await findCalendarEventForAppointment(appointment.id);

    // If it exists, update it
    if (existingEventId) {
      await updateCalendarEvent(appointment, existingEventId);
    } else {
      // Otherwise create a new event
      await createCalendarEvent(appointment);
    }
  } catch (error) {
    console.error('Error syncing appointment with calendar:', error);
    throw error;
  }
};

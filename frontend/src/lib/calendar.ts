import type { Contest } from '../types';

/**
 * Formats a Date object to Google Calendar / iCal UTC string (YYYYMMDDTHHmmssZ)
 */
export const formatToUtcCompact = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

/**
 * Generates a direct Google Calendar creation URL with pre-filled details
 */
export const getGoogleCalendarUrl = (contest: Contest): string => {
  const start = new Date(contest.startTime);
  const end = new Date(start.getTime() + contest.durationSecs * 1000);

  const startUtc = formatToUtcCompact(start);
  const endUtc = formatToUtcCompact(end);

  const title = encodeURIComponent(contest.name);
  const details = encodeURIComponent(
    `Competitive Programming Contest on ${contest.platform}\n\nJoin / Register: ${contest.url}\n\nTracked via Contest Tracker`
  );
  const location = encodeURIComponent(contest.url);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
};

/**
 * Generates and triggers the download of an RFC 5545 .ics file
 * for Apple Calendar, Outlook, and other desktop calendar apps.
 */
export const downloadIcsFile = (contest: Contest): void => {
  const start = new Date(contest.startTime);
  const end = new Date(start.getTime() + contest.durationSecs * 1000);

  const startUtc = formatToUtcCompact(start);
  const endUtc = formatToUtcCompact(end);
  const nowUtc = formatToUtcCompact(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Contest Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${contest.id || Date.now()}@contest-tracker`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${contest.name.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${contest.name}\\nPlatform: ${contest.platform}\\nURL: ${contest.url}`,
    `URL:${contest.url}`,
    `LOCATION:${contest.url}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedName = contest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  link.download = `${sanitizedName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


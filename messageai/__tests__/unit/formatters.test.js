/**
 * Unit Tests for Formatters
 * 
 * Tests all date/time and text formatting functions
 */

import {
  formatTimestamp,
  formatTime,
  formatDayOfWeek,
  formatMonthDay,
  formatFullDate,
  formatRelativeTime,
  formatMessagePreview,
  formatFileSize,
  formatPhoneNumber,
  formatParticipantCount,
  formatDisplayName,
  capitalizeFirst,
  formatNameList,
} from '../../lib/utils/formatters';

describe('Date/Time Formatters', () => {
  // Mock Date to ensure consistent testing
  const mockNow = new Date('2025-10-21T15:30:00.000Z').getTime();
  const originalDate = global.Date;

  beforeAll(() => {
    global.Date = class extends originalDate {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(mockNow);
        }
        return new originalDate(...args);
      }
      
      static now() {
        return mockNow;
      }
    };
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  describe('formatTimestamp', () => {
    it('should return empty string for invalid input', () => {
      expect(formatTimestamp(null)).toBe('');
      expect(formatTimestamp(undefined)).toBe('');
      expect(formatTimestamp(NaN)).toBe('');
      expect(formatTimestamp('invalid')).toBe('');
    });

    it('should format today\'s timestamp as time', () => {
      const today = mockNow - (2 * 60 * 60 * 1000); // 2 hours ago
      const result = formatTimestamp(today);
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = mockNow - (24 * 60 * 60 * 1000);
      expect(formatTimestamp(yesterday)).toBe('Yesterday');
    });

    it('should return day of week for dates within last week', () => {
      const threeDaysAgo = mockNow - (3 * 24 * 60 * 60 * 1000);
      const result = formatTimestamp(threeDaysAgo);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      expect(days).toContain(result);
    });

    it('should return month/day for dates within same year', () => {
      const twoMonthsAgo = new Date('2025-08-15T10:00:00.000Z').getTime();
      const result = formatTimestamp(twoMonthsAgo);
      expect(result).toBe('Aug 15');
    });

    it('should return full date for dates in different year', () => {
      const lastYear = new Date('2024-06-10T10:00:00.000Z').getTime();
      expect(formatTimestamp(lastYear)).toBe('Jun 10, 2024');
    });
  });

  describe('formatTime', () => {
    it('should return empty string for invalid input', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime(NaN)).toBe('');
    });

    it('should format time in 12-hour format with AM/PM', () => {
      // 3:45 PM
      const timestamp = new Date('2025-10-21T15:45:00.000Z').getTime();
      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });

    it('should format midnight as 12:00 AM', () => {
      // Use local midnight instead of UTC to avoid timezone issues
      const midnight = new Date(2025, 9, 21, 0, 0, 0).getTime();
      const result = formatTime(midnight);
      expect(result).toContain('12:00 AM');
    });

    it('should format noon as 12:00 PM', () => {
      // Use local noon instead of UTC to avoid timezone issues
      const noon = new Date(2025, 9, 21, 12, 0, 0).getTime();
      const result = formatTime(noon);
      expect(result).toContain('12:00 PM');
    });

    it('should pad minutes with leading zero', () => {
      const timestamp = new Date('2025-10-21T15:05:00.000Z').getTime();
      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{1,2}:05 (AM|PM)/);
    });
  });

  describe('formatDayOfWeek', () => {
    it('should return empty string for invalid input', () => {
      expect(formatDayOfWeek(null)).toBe('');
      expect(formatDayOfWeek(undefined)).toBe('');
      expect(formatDayOfWeek(NaN)).toBe('');
    });

    it('should return correct day of week', () => {
      // Tuesday, October 21, 2025
      const tuesday = new Date('2025-10-21T12:00:00.000Z').getTime();
      expect(formatDayOfWeek(tuesday)).toBe('Tuesday');
    });

    it('should handle different days correctly', () => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Test a known date for each day
      const sunday = new Date('2025-10-19T12:00:00.000Z').getTime(); // Sunday
      const monday = new Date('2025-10-20T12:00:00.000Z').getTime(); // Monday
      
      expect(days).toContain(formatDayOfWeek(sunday));
      expect(days).toContain(formatDayOfWeek(monday));
    });
  });

  describe('formatMonthDay', () => {
    it('should return empty string for invalid input', () => {
      expect(formatMonthDay(null)).toBe('');
      expect(formatMonthDay(undefined)).toBe('');
      expect(formatMonthDay(NaN)).toBe('');
    });

    it('should format as "Month Day"', () => {
      const date = new Date('2025-06-15T12:00:00.000Z').getTime();
      expect(formatMonthDay(date)).toBe('Jun 15');
    });

    it('should handle all months correctly', () => {
      const jan = new Date('2025-01-01T12:00:00.000Z').getTime();
      const dec = new Date('2025-12-31T12:00:00.000Z').getTime();
      
      expect(formatMonthDay(jan)).toBe('Jan 1');
      expect(formatMonthDay(dec)).toBe('Dec 31');
    });
  });

  describe('formatFullDate', () => {
    it('should return empty string for invalid input', () => {
      expect(formatFullDate(null)).toBe('');
      expect(formatFullDate(undefined)).toBe('');
      expect(formatFullDate(NaN)).toBe('');
    });

    it('should format as "Month Day, Year"', () => {
      const date = new Date('2024-03-15T12:00:00.000Z').getTime();
      expect(formatFullDate(date)).toBe('Mar 15, 2024');
    });

    it('should handle different years correctly', () => {
      const date2023 = new Date('2023-12-25T12:00:00.000Z').getTime();
      const date2025 = new Date('2025-01-01T12:00:00.000Z').getTime();
      
      expect(formatFullDate(date2023)).toBe('Dec 25, 2023');
      expect(formatFullDate(date2025)).toBe('Jan 1, 2025');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return empty string for invalid input', () => {
      expect(formatRelativeTime(null)).toBe('');
      expect(formatRelativeTime(undefined)).toBe('');
      expect(formatRelativeTime(NaN)).toBe('');
    });

    it('should return "just now" for very recent times', () => {
      const now = mockNow;
      const fiveSecsAgo = mockNow - 5000;
      
      expect(formatRelativeTime(now)).toBe('just now');
      expect(formatRelativeTime(fiveSecsAgo)).toBe('just now');
    });

    it('should return "just now" for future timestamps', () => {
      const future = mockNow + 5000;
      expect(formatRelativeTime(future)).toBe('just now');
    });

    it('should format seconds correctly', () => {
      const thirtySecsAgo = mockNow - (30 * 1000);
      expect(formatRelativeTime(thirtySecsAgo)).toBe('30 secs ago');
    });

    it('should format minutes correctly', () => {
      const fiveMinsAgo = mockNow - (5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinsAgo)).toBe('5 mins ago');
      
      const oneMinAgo = mockNow - (1 * 60 * 1000);
      expect(formatRelativeTime(oneMinAgo)).toBe('1 min ago');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = mockNow - (2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
      
      const oneHourAgo = mockNow - (1 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = mockNow - (3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should format weeks correctly', () => {
      const twoWeeksAgo = mockNow - (14 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('should format months correctly', () => {
      const twoMonthsAgo = mockNow - (60 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
    });

    it('should format years correctly', () => {
      const oneYearAgo = mockNow - (365 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneYearAgo)).toBe('1 year ago');
    });
  });
});

describe('Text Formatters', () => {
  describe('formatMessagePreview', () => {
    it('should return empty string for invalid input', () => {
      expect(formatMessagePreview(null)).toBe('');
      expect(formatMessagePreview(undefined)).toBe('');
      expect(formatMessagePreview(123)).toBe('');
    });

    it('should return full text if under max length', () => {
      const short = 'Hello World';
      expect(formatMessagePreview(short)).toBe('Hello World');
    });

    it('should truncate long text with ellipsis', () => {
      const long = 'This is a very long message that should be truncated to fifty characters maximum';
      const result = formatMessagePreview(long, 50);
      expect(result.length).toBe(53); // 50 chars + '...'
      expect(result).toContain('...');
    });

    it('should trim whitespace', () => {
      const text = '  Hello World  ';
      expect(formatMessagePreview(text)).toBe('Hello World');
    });

    it('should use default max length of 50', () => {
      const text = 'a'.repeat(60);
      const result = formatMessagePreview(text);
      expect(result.length).toBe(53); // 50 + '...'
    });
  });

  describe('formatFileSize', () => {
    it('should return "0 B" for invalid input', () => {
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(undefined)).toBe('0 B');
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(NaN)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500.0 B');
      expect(formatFileSize(1023)).toBe('1023.0 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(5242880)).toBe('5.0 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
      expect(formatFileSize(2147483648)).toBe('2.0 GB');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should return empty string for invalid input', () => {
      expect(formatPhoneNumber(null)).toBe('');
      expect(formatPhoneNumber(undefined)).toBe('');
    });

    it('should format 10-digit US phone number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    });

    it('should format 11-digit phone number with country code', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should return as-is for non-standard format', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678');
    });

    it('should remove non-digit characters', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
    });
  });

  describe('formatParticipantCount', () => {
    it('should return "0 participants" for invalid input', () => {
      expect(formatParticipantCount(null)).toBe('0 participants');
      expect(formatParticipantCount(undefined)).toBe('0 participants');
      expect(formatParticipantCount(NaN)).toBe('0 participants');
    });

    it('should use singular for 1 participant', () => {
      expect(formatParticipantCount(1)).toBe('1 participant');
    });

    it('should use plural for multiple participants', () => {
      expect(formatParticipantCount(2)).toBe('2 participants');
      expect(formatParticipantCount(5)).toBe('5 participants');
      expect(formatParticipantCount(100)).toBe('100 participants');
    });
  });

  describe('formatDisplayName', () => {
    it('should return display name if provided', () => {
      expect(formatDisplayName('John Doe', 'john@example.com')).toBe('John Doe');
    });

    it('should trim whitespace from display name', () => {
      expect(formatDisplayName('  Jane Smith  ', 'jane@example.com')).toBe('Jane Smith');
    });

    it('should return email username if no display name', () => {
      expect(formatDisplayName('', 'alice@example.com')).toBe('alice');
      expect(formatDisplayName(null, 'bob@test.com')).toBe('bob');
    });

    it('should return "Unknown User" if no display name or email', () => {
      expect(formatDisplayName('', '')).toBe('Unknown User');
      expect(formatDisplayName(null, null)).toBe('Unknown User');
    });
  });

  describe('capitalizeFirst', () => {
    it('should return empty string for invalid input', () => {
      expect(capitalizeFirst(null)).toBe('');
      expect(capitalizeFirst(undefined)).toBe('');
    });

    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('world')).toBe('World');
    });

    it('should lowercase the rest of the string', () => {
      expect(capitalizeFirst('HELLO')).toBe('Hello');
      expect(capitalizeFirst('hELLO')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });
  });

  describe('formatNameList', () => {
    it('should return empty string for invalid input', () => {
      expect(formatNameList(null)).toBe('');
      expect(formatNameList(undefined)).toBe('');
      expect(formatNameList([])).toBe('');
    });

    it('should return single name as-is', () => {
      expect(formatNameList(['Alice'])).toBe('Alice');
    });

    it('should format two names with "and"', () => {
      expect(formatNameList(['Alice', 'Bob'])).toBe('Alice and Bob');
    });

    it('should format three or more names with commas and "and"', () => {
      expect(formatNameList(['Alice', 'Bob', 'Charlie'])).toBe('Alice, Bob, and Charlie');
      expect(formatNameList(['A', 'B', 'C', 'D'])).toBe('A, B, C, and D');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle null and undefined gracefully across all functions', () => {
    // These should not throw errors
    expect(() => formatTimestamp(null)).not.toThrow();
    expect(() => formatTime(undefined)).not.toThrow();
    expect(() => formatRelativeTime(null)).not.toThrow();
    expect(() => formatMessagePreview(null)).not.toThrow();
    expect(() => formatFileSize(undefined)).not.toThrow();
    expect(() => formatPhoneNumber(null)).not.toThrow();
  });

  it('should handle extreme values', () => {
    expect(formatFileSize(Number.MAX_SAFE_INTEGER)).toBeDefined();
    expect(formatParticipantCount(999999)).toBe('999999 participants');
  });

  it('should handle special characters in text', () => {
    expect(formatMessagePreview('Hello 😊 World')).toBe('Hello 😊 World');
    expect(formatDisplayName('John_Doe-123', 'john@test.com')).toBe('John_Doe-123');
  });
});


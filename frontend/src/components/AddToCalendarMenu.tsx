import { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ExternalLink, Download, ChevronDown } from 'lucide-react';
import type { Contest } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile } from '../lib/calendar';

interface AddToCalendarMenuProps {
  contest: Contest;
  variant?: 'compact' | 'button';
}

export const AddToCalendarMenu: React.FC<AddToCalendarMenuProps> = ({ contest, variant = 'compact' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getGoogleCalendarUrl(contest);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIcsFile(contest);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1 p-1.5 rounded-lg text-textMuted hover:text-text hover:bg-surfaceHover transition-colors cursor-pointer border border-transparent hover:border-borderMuted"
          title="Add to Calendar"
          aria-label="Add to Calendar"
        >
          <CalendarPlus className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-surface hover:bg-surfaceHover border border-borderMuted text-text shadow-sm transition-all cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4 text-amber-500" />
          <span>Add to Calendar</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      )}

      {isOpen && (
        <div 
          className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-52 rounded-xl bg-surface border border-borderMuted shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          role="menu"
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-textMuted uppercase tracking-wider border-b border-borderMuted mb-1">
            Add to Calendar
          </div>

          <button
            onClick={handleGoogleCalendar}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-text hover:bg-surfaceHover transition-colors cursor-pointer text-left"
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Google Calendar
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-textMuted" />
          </button>

          <button
            onClick={handleDownloadIcs}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-text hover:bg-surfaceHover transition-colors cursor-pointer text-left"
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Apple / Outlook (.ics)
            </span>
            <Download className="w-3.5 h-3.5 text-textMuted" />
          </button>
        </div>
      )}
    </div>
  );
};


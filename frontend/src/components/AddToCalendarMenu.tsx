import { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ExternalLink, Download, ChevronDown } from 'lucide-react';
import type { Contest } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile } from '../lib/calendar';
import { cn } from '../lib/utils';

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
    <div className={cn("relative inline-block text-left", isOpen ? "z-50" : "z-10")} ref={menuRef}>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "flex items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer border",
            isOpen
              ? "bg-surfaceHover border-borderMuted text-text"
              : "border-transparent text-textMuted hover:text-text hover:bg-surfaceHover hover:border-borderMuted"
          )}
          title="Add to Calendar"
          aria-label="Add to Calendar"
        >
          <CalendarPlus className="w-4 h-4" />
          <ChevronDown className={cn("w-3 h-3 opacity-60 transition-transform", isOpen && "rotate-180")} />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border shadow-sm transition-all cursor-pointer",
            isOpen
              ? "bg-surfaceHover border-borderMuted text-text"
              : "bg-surface hover:bg-surfaceHover border-borderMuted text-text"
          )}
        >
          <CalendarPlus className="w-4 h-4 text-amber-500" />
          <span>Add to Calendar</span>
          <ChevronDown className={cn("w-3.5 h-3.5 opacity-60 transition-transform", isOpen && "rotate-180")} />
        </button>
      )}

      {isOpen && (
        <div 
          className={cn(
            "absolute mt-2 w-56 rounded-xl bg-surface border border-borderMuted shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/10",
            variant === 'compact' ? "right-0 top-full" : "left-0 sm:left-auto sm:right-0 top-full"
          )}
          role="menu"
        >
          <div className="px-3.5 py-1.5 text-xs font-semibold text-textMuted uppercase tracking-wider border-b border-borderMuted mb-1">
            Add to Calendar
          </div>

          <button
            onClick={handleGoogleCalendar}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm text-text hover:bg-surfaceHover transition-colors cursor-pointer text-left"
            role="menuitem"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="font-medium">Google Calendar</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-textMuted shrink-0" />
          </button>

          <button
            onClick={handleDownloadIcs}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm text-text hover:bg-surfaceHover transition-colors cursor-pointer text-left"
            role="menuitem"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-medium">Apple / Outlook (.ics)</span>
            </span>
            <Download className="w-3.5 h-3.5 text-textMuted shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Users, X, ShieldAlert, Hand, Ban, Trash2, EyeOff } from 'lucide-react';
import { Button, IconButton, Badge } from '@inkroom/ui';
import { useUIStore } from '../stores/uiStore';
import type { Role, AwarenessState } from '@inkroom/shared';

export interface ParticipantsPanelProps {
  participants: AwarenessState[];
  currentRole: Role;
  onMuteParticipant?: (id: string) => void;
  onClearParticipantStrokes?: (id: string) => void;
  onKickParticipant?: (id: string) => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentRole,
  onMuteParticipant,
  onClearParticipantStrokes,
  onKickParticipant,
}) => {
  const { isParticipantsDrawerOpen, setParticipantsDrawerOpen } = useUIStore();

  if (!isParticipantsDrawerOpen) return null;

  const isTeacher = currentRole === 'teacher' || currentRole === 'co-teacher';

  // Sort raised hands to the top
  const sorted = [...participants].sort((a, b) => {
    if (a.handRaised && !b.handRaised) return -1;
    if (!a.handRaised && b.handRaised) return 1;
    return 0;
  });

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Classroom Attendees
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
            {participants.length}
          </span>
        </div>
        <IconButton
          label="Close panel"
          size="sm"
          onClick={() => setParticipantsDrawerOpen(false)}
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {sorted.map((item) => {
          const user = item.user;
          if (!user) return null;

          return (
            <div
              key={user.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                item.handRaised
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar dot */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: user.color || '#4F46E5' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {user.name}
                    </span>
                    {item.handRaised && (
                      <span className="text-xs" title="Hand raised!">
                        ✋
                      </span>
                    )}
                  </div>
                  <Badge
                    variant={user.role === 'teacher' ? 'purple' : 'default'}
                    className="mt-0.5 text-[10px]"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Teacher Moderation Controls */}
              {isTeacher && user.role !== 'teacher' && (
                <div className="flex items-center gap-1">
                  <IconButton
                    label="Clear their strokes"
                    size="sm"
                    onClick={() => onClearParticipantStrokes?.(user.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </IconButton>
                  <IconButton
                    label="Mute / Remove"
                    size="sm"
                    onClick={() => onKickParticipant?.(user.id)}
                  >
                    <Ban className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </IconButton>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

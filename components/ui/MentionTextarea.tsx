"use client";

import React, { useRef } from "react";
import { useMentionParser, type UserMention } from "@/hooks/useMentionParser";
import { AtSign } from "lucide-react";

interface MentionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (newValue: string) => void;
  availableUsers?: UserMention[];
  label?: string;
}

const DEFAULT_TEAM_MEMBERS: UserMention[] = [
  { id: "u1", username: "sarah", name: "Sarah Jenkins" },
  { id: "u2", username: "david", name: "David Miller" },
  { id: "u3", username: "elena", name: "Elena Rostova" },
  { id: "u4", username: "marcus", name: "Marcus Chen" },
  { id: "u5", username: "jessica", name: "Jessica Taylor" },
];

export default function MentionTextarea({
  value,
  onValueChange,
  availableUsers = DEFAULT_TEAM_MEMBERS,
  label,
  rows = 3,
  placeholder = "Type notes or mention team members using @username...",
  className = "",
  ...props
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { isMentionOpen, mentionSearch, handleTextChange, insertMention } = useMentionParser(availableUsers);

  const filteredUsers = availableUsers.filter(
    (u) =>
      !mentionSearch ||
      u.username.toLowerCase().includes(mentionSearch) ||
      u.name.toLowerCase().includes(mentionSearch)
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onValueChange(val);
    handleTextChange(val, e.target.selectionStart || 0);
  };

  const handleSelectUser = (user: UserMention) => {
    const { newText, newCursorPos } = insertMention(value, user);
    onValueChange(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="relative space-y-1">
      {label && <label className="text-xs font-semibold text-crm-muted">{label}</label>}
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card resize-none ${className}`}
          {...props}
        />

        {/* Floating Mention Autocomplete Dropdown */}
        {isMentionOpen && filteredUsers.length > 0 && (
          <div className="absolute left-2 bottom-full mb-1 w-64 rounded-xl border border-crm-border bg-crm-card p-2 shadow-2xl z-50 animate-fade-in max-h-48 overflow-y-auto">
            <div className="flex items-center gap-1.5 border-b border-crm-border/40 pb-1.5 mb-1 px-2 text-[10px] font-bold text-crm-muted uppercase tracking-wider">
              <AtSign className="h-3 w-3 text-indigo-400" />
              <span>Mention Teammate</span>
            </div>
            <div className="space-y-0.5">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-white hover:bg-crm-cardHover transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] text-crm-muted">@{user.username}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

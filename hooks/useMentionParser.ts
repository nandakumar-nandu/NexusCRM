"use client";

import { useState, useCallback } from "react";

export interface UserMention {
  id: string;
  username: string;
  name: string;
}

/**
 * Custom React Hook: useMentionParser
 * 
 * Provides regex parsing, cursor positioning detection, and token extraction for @mentions.
 * 
 * Technical Implementation & Architectural Comments:
 * 
 * 1. Cursor Positioning Technique:
 *    When the user types in an input or textarea, we inspect `selectionStart` to determine the active cursor index.
 *    We check the text preceding the cursor using `text.slice(0, cursorIndex)` to detect if the user typed `@` followed
 *    by partial characters (e.g., `@sarah`). This calculates the exact relative pixel/character coordinates to anchor
 *    the floating autocomplete dropdown menu.
 * 
 * 2. Regex Pattern Matching:
 *    Mentions are matched using the regular expression `/@([a-zA-Z0-9_\.\-]+)/g`.
 *    Group 1 captures the raw handle/username following the `@` symbol.
 * 
 * 3. Two-Phase Storage vs Display Approach:
 *    - Phase 1 (Display/Editing): The text is stored containing human-readable `@Name` or `@username` tokens.
 *    - Phase 2 (Storage/Persistence): Upon submission, the parser extracts mentioned handle tokens, resolves their
 *      corresponding User IDs from team directories, and creates targeted mention notifications (`type: 'mention'`).
 */
export function useMentionParser(availableUsers: UserMention[] = []) {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);

  /**
   * Evaluates input changes and cursor position to show/hide mention suggestion popups
   */
  const handleTextChange = useCallback((text: string, cursorPosition: number) => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      // Ensure no spaces exist after the @ symbol
      if (!query.includes(" ") && query.length < 20) {
        setMentionSearch(query.toLowerCase());
        setMentionStartIndex(lastAtIndex);
        setIsMentionOpen(true);
        return;
      }
    }

    setIsMentionOpen(false);
    setMentionSearch(null);
    setMentionStartIndex(-1);
  }, []);

  /**
   * Inserts selected user mention into text string
   */
  const insertMention = useCallback(
    (currentText: string, user: UserMention): { newText: string; newCursorPos: number } => {
      if (mentionStartIndex === -1) return { newText: currentText, newCursorPos: currentText.length };

      const before = currentText.slice(0, mentionStartIndex);
      const after = currentText.slice(mentionStartIndex + (mentionSearch?.length || 0) + 1);
      const mentionToken = `@${user.username} `;
      const newText = `${before}${mentionToken}${after}`;
      const newCursorPos = before.length + mentionToken.length;

      setIsMentionOpen(false);
      setMentionSearch(null);

      return { newText, newCursorPos };
    },
    [mentionStartIndex, mentionSearch]
  );

  /**
   * Parses text string and extracts all mentioned user IDs
   */
  const parseMentionsFromText = useCallback(
    (text: string): UserMention[] => {
      const MENTION_REGEX = /@([a-zA-Z0-9_\.\-]+)/g;
      const matches = Array.from(text.matchAll(MENTION_REGEX));
      const mentionedHandles = new Set(matches.map((m) => m[1].toLowerCase()));

      return availableUsers.filter(
        (u) => mentionedHandles.has(u.username.toLowerCase()) || mentionedHandles.has(u.name.toLowerCase().replace(/\s+/g, ""))
      );
    },
    [availableUsers]
  );

  return {
    isMentionOpen,
    mentionSearch,
    handleTextChange,
    insertMention,
    parseMentionsFromText,
  };
}

'use client';

import { useState, useRef, useEffect } from 'react';

interface User {
  id: number;
  name: string;
}

interface MentionTextAreaProps {
  value: string;
  onChange: (value: string, mentions: number[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MentionTextArea({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  rows = 4,
  className = ""
}: MentionTextAreaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentions, setMentions] = useState<number[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 사용자 검색
  const searchUsers = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setSuggestions(users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // 텍스트 변경 처리
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // @ 멘션 감지
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // @와 커서 사이에 공백이 없고, @가 문장 시작이거나 공백 뒤에 있는 경우
      if (!textAfterAt.includes(' ') && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
        setMentionStart(lastAtIndex);
        // setCurrentQuery(textAfterAt); // Reserved for future use
        setShowSuggestions(true);
        setSelectedIndex(0);
        searchUsers(textAfterAt);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    // 멘션된 사용자 ID 추출 will be implemented here
    const foundMentions: number[] = [];

    // This will be implemented to track mentioned users
    // while ((match = mentionRegex.exec(newValue)) !== null) {
    //   // Process mentions here
    // }

    setMentions(foundMentions);
    onChange(newValue, foundMentions);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        selectUser(suggestions[selectedIndex]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // 사용자 선택
  const selectUser = (user: User) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforeMention = value.substring(0, mentionStart);
    const afterCursor = value.substring(textarea.selectionStart);

    const newValue = beforeMention + `@${user.name} ` + afterCursor;
    const newMentions = [...mentions, user.id];

    setMentions(newMentions);
    onChange(newValue, newMentions);
    setShowSuggestions(false);

    // 커서 위치 조정
    setTimeout(() => {
      const newCursorPosition = beforeMention.length + user.name.length + 2;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);
  };

  // 클릭으로 벗어날 때 suggestions 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />

      {/* 멘션 추천 목록 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              onClick={() => selectUser(user)}
              className={`px-4 py-2 cursor-pointer flex items-center space-x-3 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-900">@{user.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
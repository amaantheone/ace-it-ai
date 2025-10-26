import React from 'react';

export const StartLearningIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M16 14l8 6-8 6V14z" fill="currentColor"/>
  </svg>
);

export const MindMapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="4" fill="currentColor"/>
    <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
    <circle cx="24" cy="8" r="2.5" fill="currentColor"/>
    <circle cx="8" cy="24" r="2.5" fill="currentColor"/>
    <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
    <line x1="12.8" y1="13.2" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="19.2" y1="13.2" x2="21.5" y2="10.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12.8" y1="18.8" x2="10.5" y2="21.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="19.2" y1="18.8" x2="21.5" y2="21.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const QuizIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 14h8M12 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="14" r="1" fill="currentColor"/>
    <circle cx="8" cy="18" r="1" fill="currentColor"/>
    <path d="M16 2v4M12 4h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const FlashCardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 12h12M8 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="20" cy="10" r="1.5" fill="currentColor"/>
  </svg>
);

export const BookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M16 4v24M8 12h6M8 16h6M18 12h6M18 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const BrainNetworkIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4c-2.5 0-4.5 1.5-5.5 3.5C9 8 8 9.5 8 11.5c0 1.5.5 2.8 1.3 3.8C8.5 16.2 8 17.5 8 19c0 2.5 2 4.5 4.5 4.5.8 0 1.5-.2 2.2-.5.8 1.8 2.6 3 4.8 3 2.8 0 5-2.2 5-5 0-.8-.2-1.5-.5-2.2 1.8-.8 3-2.6 3-4.8 0-2.8-2.2-5-5-5-.8 0-1.5.2-2.2.5C19 8.6 17.6 7.5 16 7.5c-.3 0-.5 0-.8.1C15.7 6.2 16 4.8 16 4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="20" cy="15" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="20" r="1.5" fill="currentColor"/>
    <line x1="13.2" y1="13.2" x2="18.8" y2="13.8" stroke="currentColor" strokeWidth="1"/>
    <line x1="17.2" y1="18.8" x2="13.8" y2="13.2" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const Icons = {
  StartLearningIcon,
  MindMapIcon,
  QuizIcon,
  FlashCardIcon,
  BookIcon,
  BrainNetworkIcon,
  SwitchCamera: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
      <path d="m18 9-2-2" />
      <path d="m6 9 2-2" />
    </svg>
  ),
} as const;

export type IconName = keyof typeof Icons;

export function Icon({
  name,
  size = 24,
  color = 'currentColor',
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const icon = Icons[name];
  if (!icon) {
    throw new Error(`Icon not found: ${name}`);
  }
  return React.createElement(icon, { size, color } as React.SVGProps<SVGSVGElement>);
}
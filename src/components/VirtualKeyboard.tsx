'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  visible: boolean;
}

const VirtualKeyboard = ({ onKeyPress, visible }: VirtualKeyboardProps) => {
  if (!visible) return null;

  const vowels = [
    ['a', 'ɑ', 'e', 'ə', 'ɛ', 'i', 'o', 'ɔ', 'u', 'ʉ', 'ʼ'],
    ['à', 'à', 'è', 'ə̀', 'ɛ̀', 'ì', 'ò', 'ɔ̀', 'ù', 'ʉ̀'],
    ['á', 'á', 'é', 'ə́', 'ɛ́', 'í', 'ó', 'ɔ́', 'ú', 'ʉ́'],
    ['ā', 'ā', 'ē', 'ə̄', 'ɛ̄', 'ī', 'ō', 'ɔ̄', 'ū', 'ʉ̄'],
    ['ǎ', 'ǎ', 'ě', 'ə̌', 'ɛ̌', 'ǐ', 'ǒ', 'ɔ̌', 'ǔ', 'ʉ̌'],
    ['â', 'â', 'ê', 'ə̂', 'ɛ̂', 'î', 'ô', 'ɔ̂', 'û', 'ʉ̂'],
  ];

  return (
    <div className="p-2 border rounded-lg bg-background shadow-sm">
      <div className="grid gap-1">
        {vowels.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((char, charIndex) => (
              <Button
                key={`${rowIndex}-${charIndex}`}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 text-sm font-medium"
                onClick={() => onKeyPress(char)}
              >
                {char}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualKeyboard;

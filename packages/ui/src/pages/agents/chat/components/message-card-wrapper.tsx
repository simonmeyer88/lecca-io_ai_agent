import React, { useState } from 'react';

import { Icons } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { Tooltip } from '../../../../components/ui/tooltip';
import { cn } from '../../../../utils/cn';
import {
  toLocaleStringOrUndefined,
  toLocaleTimeOrDateTimeOrUndefined,
} from '../../../../utils/dates';

export function MessageCardWrapper({
  children,
  className,
  text,
  side = 'left',
  createdAt,
  prefix,
}: {
  children: React.ReactNode;
  className?: string;
  text: string;
  side?: 'left' | 'right';
  createdAt: Date | undefined;
  prefix?: React.ReactNode;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Start speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false); // Reset when speech ends
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className={cn('relative group animate-fade-i', className)}>
      {children}
      <div
        className={cn('flex invisible group-hover:visible items-center', {
          'pl-10 justify-start': side === 'left',
          'justify-end pr-2 pt-1': side === 'right',
        })}
      >
        {side === 'right' && (
          <>
            {prefix != null && <div className="mr-3">{prefix}</div>}
            <Tooltip>
              <Tooltip.Trigger>
                <div className="mr-2 invisible group-hover:visible flex items-center text-muted-foreground text-xs">
                  {toLocaleTimeOrDateTimeOrUndefined(createdAt)}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                {toLocaleStringOrUndefined(createdAt)}
              </Tooltip.Content>
            </Tooltip>
          </>
        )}

        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-1.5 py-4"
              type="button"
              onClick={handleCopy}
            >
              {copied ? (
                <Icons.check className="w-4 h-4 text-green-500" />
              ) : (
                <Icons.copy className="w-4 h-4" />
              )}{' '}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Copy</Tooltip.Content>
        </Tooltip>

        {/* Read Aloud */}
        {window.speechSynthesis && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-1.5 py-4"
                type="button"
                onClick={handleReadAloud}
              >
                {isSpeaking ? (
                  <Icons.mute className="w-4 h-4" />
                ) : (
                  <Icons.audio className="w-4 h-4" />
                )}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">
              {isSpeaking ? 'Mute' : 'Read Aloud'}
            </Tooltip.Content>
          </Tooltip>
        )}

        {side === 'left' && (
          <div className="ml-2 invisible group-hover:visible flex items-center text-muted-foreground text-xs">
            {toLocaleTimeOrDateTimeOrUndefined(createdAt)}
          </div>
        )}
      </div>
    </div>
  );
}

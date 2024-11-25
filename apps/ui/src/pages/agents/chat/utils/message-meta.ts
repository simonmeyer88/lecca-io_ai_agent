import React from 'react';

export class MessageMeta {
  constructor(setState: React.Dispatch<React.SetStateAction<number>>) {
    this.setState = setState;
  }

  data: MessageToolRef = {};
  setState: React.Dispatch<React.SetStateAction<number>>;
  forceRefresh = () => {
    this.setState((prev) => prev + 1);
  };
}

export type MessageToolRef = Record<
  number,
  { type: 'start' | 'end' | 'between'; count?: number; isWorking?: boolean }
>;

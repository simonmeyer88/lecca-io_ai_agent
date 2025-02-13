import React from 'react';

export class MessageMeta {
  constructor(setState: React.Dispatch<React.SetStateAction<number>>) {
    this.setState = setState;
  }

  data: MessageToolRef = [];
  setState: React.Dispatch<React.SetStateAction<number>>;
  forceRefresh = () => {
    this.setState((prev) => prev + 1);
  };
}

export type MessageToolRef = {
  position: 'start' | 'end' | 'between';
  type: 'tool-invocation' | 'text';
}[][];

import { Link } from 'react-router-dom';

import { Icons } from '@/components/icons';
import { MarkdownViewer } from '@/components/markdown-viewer';
import { Agent } from '@/models/agent/agent-model';

import { MessageCardWrapper } from './message-card-wrapper';

export const MessageAgentCard = ({
  agent,
  textContent,
  status,
  createdAt,
}: {
  agent: Agent;
  textContent: string;
  status: 'loading' | 'idle';
  createdAt: Date | undefined;
}) => {
  if (textContent === '' && status === 'idle') {
    return null;
  }

  return (
    <MessageCardWrapper text={textContent} createdAt={createdAt}>
      <Link to={`/redirect?redirect=/agents/${agent.id}`}>
        <div className="flex items-center space-x-2">
          <div className="border rounded-md p-1.5 mr-1">
            <Icons.messageAgent className="size-5" />
          </div>
          <div className="flex items-center space-x-1.5 text-sm">
            <span className="font-medium">{agent.name}</span>
            {status === 'loading' && (
              <span className="text-muted-foreground">is working...</span>
            )}
          </div>
        </div>
      </Link>
      <div className="ml-12">
        <MarkdownViewer>{textContent}</MarkdownViewer>
      </div>
    </MessageCardWrapper>
  );
};

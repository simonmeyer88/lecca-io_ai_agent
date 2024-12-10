import { Icons } from '../../../../components/icons';
import { MarkdownViewer } from '../../../../components/markdown-viewer';

import { MessageCardWrapper } from './message-card-wrapper';

export const MessageSystemCard = ({
  textContent,
  createdAt,
}: {
  textContent: string;
  createdAt: Date | undefined;
}) => {
  return (
    <MessageCardWrapper text={textContent} createdAt={createdAt}>
      <div className="">
        <div className="flex items-center space-x-2">
          <div className="border rounded-md p-1.5 mr-1">
            <Icons.alertCircle className="size-5 text-red-500" />
          </div>
          <div className="flex items-center space-x-1.5 text-sm">
            <span className="font-medium">System Message</span>
          </div>
        </div>
      </div>
      <div className="ml-12">
        <MarkdownViewer>
          {textContent || 'Something went wrong. Try again.'}
        </MarkdownViewer>
      </div>
    </MessageCardWrapper>
  );
};

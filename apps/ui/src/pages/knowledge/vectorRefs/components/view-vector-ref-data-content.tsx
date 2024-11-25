import { useParams } from 'react-router-dom';

import { appQueryClient } from '@/api/api-library';
import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ViewVectorRefDataContent({
  vectorRefId,
}: {
  vectorRefId: string;
}) {
  const { knowledgeId } = useParams();

  const { data: vectorRefData, isLoading: isLoadingVectorRefData } =
    useApiQuery({
      service: 'knowledge',
      method: 'getVectorRefData',
      apiLibraryArgs: {
        knowledgeId: knowledgeId!,
        vectorRefId: vectorRefId,
      },
    });

  return (
    <div>
      <Card.Header>
        <Card.Title>Knowledge Data</Card.Title>
        <Card.Description>
          This is the raw data that is saved to your knowledge notebook
        </Card.Description>
      </Card.Header>
      <Card.Content className="overflow-y-auto max-h-[calc(80dvh-100px)]">
        {isLoadingVectorRefData ? (
          <Icons.spinner className="animate-spin size-5 mx-auto" />
        ) : !vectorRefData || vectorRefData === '' ? (
          <div className="flex items-center space-x-4">
            <div className="text-muted-foreground text-center">
              Your data is still being processed...
            </div>
            <Button
              onClick={() => {
                //invalidate the query
                appQueryClient.invalidateQueries({
                  queryKey: ['knowledge', 'getVectorRefData', knowledgeId],
                });
              }}
            >
              Refresh
            </Button>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{vectorRefData}</p>
        )}
      </Card.Content>
    </div>
  );
}

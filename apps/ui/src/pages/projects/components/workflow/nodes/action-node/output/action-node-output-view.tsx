import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

import { OutputSelector } from './output-selector';

 
type ActionNodeOutputViewProps = {
  data: Record<string, any> | undefined;
  viewBuilder?: () => void;
};
export function ActionNodeOutputView({
  data,
  viewBuilder,
}: ActionNodeOutputViewProps) {
  return (
    <div className="flex flex-col">
      <Form.Content className="pr-4 py-0 pb-4 pt-4">
        <div className="text-muted-foreground text-sm pb-2">
          This data might not be the actual data that will be used when the
          workflow is executed. It just reflects the most likely shape of the
          data if the workflow were to execute now.
        </div>

        <ScrollArea className="!max-h-[50vh] overflow-y-auto">
          <OutputSelector data={data} hideRoot />
        </ScrollArea>
      </Form.Content>
      {viewBuilder && (
        <Form.Footer className="space-x-2 py-2 border-t flex justify-between">
          <div>
            <Button
              type="button"
              variant="ghost"
              className="space-x-2"
              onClick={() => {
                viewBuilder();
              }}
            >
              <Icons.arrowLeft />
              <span>Back</span>
            </Button>
          </div>
          <div className="flex space-x-2"></div>
        </Form.Footer>
      )}
    </div>
  );
}

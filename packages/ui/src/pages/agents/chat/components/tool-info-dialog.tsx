import { JsonViewer } from '../../../../components/json-viewer';
import { Button } from '../../../../components/ui/button';
import { Dialog } from '../../../../components/ui/dialog';
import { Separator } from '../../../../components/ui/separator';
import { Tabs } from '../../../../components/ui/tabs';
import { StreamedTaskAssistantMessageToolInvocation } from '../../../../models/task/streamed-task-message-model';

export function ToolInfoDialog({
  tool,
  label,
}: {
  tool: StreamedTaskAssistantMessageToolInvocation;
  label: string;
}) {
  return (
    <Dialog.Content className="max-w-[600px]">
      <Dialog.Header className="pt-4 px-4 text-lg font-medium">
        <span>{label}</span>
      </Dialog.Header>
      <Separator />
      <Tabs defaultValue="output">
        <Tabs.List className="mx-2">
          <Tabs.Trigger value="output">Output</Tabs.Trigger>
          <Tabs.Trigger value="input">Input</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="output"
          className="p-4 h-full overflow-y-auto max-h-[calc(60dvh-50px)]"
        >
          <JsonViewer
            data={tool.result?.success ?? tool.result?.failure ?? {}}
            shouldExpandNodeInitially={() => true}
          />
        </Tabs.Content>
        <Tabs.Content
          value="input"
          className="p-4 h-full overflow-y-auto max-h-[calc(60dvh-50px)]"
        >
          <JsonViewer
            data={tool.args ?? {}}
            shouldExpandNodeInitially={() => true}
          />
        </Tabs.Content>
      </Tabs>
      <Separator />
      <Dialog.Footer className="p-4 pt-0">
        <Dialog.Close asChild>
          <Button>Close</Button>
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  );
}

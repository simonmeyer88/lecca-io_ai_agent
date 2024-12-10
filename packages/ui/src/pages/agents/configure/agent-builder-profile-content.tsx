import { UseFormReturn } from 'react-hook-form';

import { Checkbox } from '../../../components/ui/checkbox';
import { Form } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useUser } from '../../../hooks/useUser';
import { UpdateAgentType } from '../../../models/agent/agent-model';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
};

export function AgentBuilderProfileContent({ form }: PropType) {
  const { enabledFeatures } = useUser();

  return (
    <div className="">
      <Form.Header>
        <Form.Title>Agent Profile</Form.Title>
        <Form.Subtitle>
          Add a name and description to easily identify this agent.
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item className="max-w-96">
              <Form.Label>Name</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Add a name"
                  autoFocus
                  onFocus={(e) => {
                    if (e.target.value === 'Untitled Agent') {
                      e.target.select();
                    }
                  }}
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea placeholder="Add an agent description" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        {enabledFeatures.WEB_SEARCH ||
        enabledFeatures.WEB_EXTRACTION_DYNAMIC ||
        enabledFeatures.WEB_EXTRACTION_STATIC ? (
          <Form.Field
            control={form.control}
            name="webAccess"
            render={({ field }) => (
              <Form.Item>
                <div className="flex items-center space-x-2">
                  <Form.Label htmlFor="web-access-checkbox">
                    Web Access
                  </Form.Label>
                  <Checkbox
                    id="web-access-checkbox"
                    checked={!!field.value}
                    onCheckedChange={(value) => field.onChange(value)}
                  >
                    Web Access
                  </Checkbox>
                </div>
                <Form.Description>
                  Allows the agent to search the web and access websites to
                  retrieve information.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        ) : null}
        {enabledFeatures.CALLING ? (
          <Form.Field
            control={form.control}
            name="phoneAccess"
            render={({ field }) => (
              <Form.Item>
                <div className="flex items-center space-x-2">
                  <Form.Label htmlFor="phone-access-checkbox">
                    Phone Access
                  </Form.Label>
                  <Checkbox
                    id="phone-access-checkbox"
                    checked={!!field.value}
                    onCheckedChange={(value) => field.onChange(value)}
                  >
                    Phone Access
                  </Checkbox>
                </div>
                <Form.Description>
                  Allows the agent to perform outbound calls up to 10 minutes.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        ) : null}
        <Form.Field
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Instructions</Form.Label>
              <Form.Control>
                <Textarea
                  placeholder="e.g. You are an assistant that helps users filter their inbox. You should ask the user for the criteria they want to filter by before performing any actions."
                  className="placeholder:opacity-70 placeholder:italic"
                  rows={10}
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </Form.Content>
    </div>
  );
}

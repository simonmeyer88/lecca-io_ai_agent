import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { Form } from '../ui/form';
import { Select } from '../ui/select';
import { Skeleton } from '../ui/skeleton';

export function SelectProjectField({ form }: { form: UseFormReturn & any }) {
  const { projectId } = useParams();
  const { data: projects, isLoading: isLoadingProjects } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  useEffect(() => {
    if (projectId) {
      form.setValue('projectId', projectId);
    }
  }, [projectId, form]);

  if (projects?.length === 0) return null;

  return (
    <Form.Field
      control={form.control}
      name="projectId"
      render={({ field }) =>
        isLoadingProjects ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <Form.Item>
            <Form.Label>
              Project
              <span className="ml-1.5 text-muted-foreground font-normal text-xs">
                optional
              </span>
            </Form.Label>
            <Form.Control>
              <Select
                onValueChange={(value) => {
                  if (value === 'none') {
                    field.onChange(undefined);
                  } else {
                    field.onChange(value);
                  }
                }}
              >
                <Select.Trigger>
                  <Select.Value
                    placeholder={
                      field.value
                        ? projects?.find(
                            (project) => project.id === field.value,
                          )?.name
                        : 'Select a project'
                    }
                  />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item key={'none'} value={'none'}>
                    No Project
                  </Select.Item>
                  {projects?.map((project) => (
                    <Select.Item key={project.id} value={project.id}>
                      {project.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Description className="ml-1">
              This cannot be changed once created.
            </Form.Description>
          </Form.Item>
        )
      }
    />
  );
}

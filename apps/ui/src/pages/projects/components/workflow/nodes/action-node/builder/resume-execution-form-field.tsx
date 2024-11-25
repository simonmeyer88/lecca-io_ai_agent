import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Node } from 'reactflow';

import { useProjectWorkflow } from '@/hooks/useProjectWorkflow';

export function ResumeExecutionFormField({
  form,
  node,
}: {
   
  form: UseFormReturn<any, any, undefined>;
  node: Node;
}) {
  const { setRerenderKey } = useProjectWorkflow();

  useEffect(() => {
    if (
      node.data.executionStatus === 'NEEDS_INPUT' ||
      node.data.executionStatus === 'SCHEDULED'
    ) {
      //This is enough to enable the resume execution button
      form.setValue('customInputConfigValues', {
        resumeExecution: true,
      });

      setRerenderKey((prev) => prev + 1); //To rerender the Resume button to not be disabled.
    }
  }, [form, form.setValue, node.data.executionStatus, setRerenderKey]);

  return null;
}

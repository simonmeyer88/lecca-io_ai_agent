import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { api, appQueryClient } from '../../api/api-library';
import { useProjectWorkflow } from '../../hooks/useProjectWorkflow';
import { Execution } from '../../models/execution-model';

export function ExecutionProvider({ children }: { children: React.ReactNode }) {
  const { executionId, projectId } = useParams();
  const { setRerenderKey, setHasRenderedInitialData } = useProjectWorkflow();
  //   const [execution, setExecution] = useState<Execution | null>(null);
  const executionRef = useRef<Execution | null>(null);
  const [callAgainCounter, setCallAgainCounter] = useState(0);

  const fetchExecutionUpdate = useCallback(
    async ({ isInitialCall }: { isInitialCall: boolean }) => {
      //Clear the cache for the execution so we can fetch the new data
      appQueryClient.invalidateQueries({
        queryKey: ['executions', 'getById', executionId, projectId],
      });

      const executionResponse = await appQueryClient.fetchQuery({
        queryKey: ['executions', 'getById', executionId, projectId],
        queryFn: async () => {
          const response = await api.executions.getById({
            id: executionId!,
          });

          if (response.data) {
            return response.data;
          } else {
            throw response.error;
          }
        },
      });

      const execution = executionResponse as Execution;
      executionRef.current = execution;

      if (!isInitialCall) {
        setHasRenderedInitialData(false); //To prevent the node dialogs/popovers from auto opening when we rerender the entire tree
        setRerenderKey((prev) => prev + 1);
        //If this is not the initial call, then invalidate the nodes
      }
    },
    [executionId, projectId, setHasRenderedInitialData, setRerenderKey],
  );

  const checkIfExecutionUpdatedAtHasChanged = useCallback(async () => {
    if (executionRef.current || callAgainCounter === 0) {
      if (executionRef.current) {
        const response =
          await api.executions.checkIfExecutionUpdatedAtHasChanged({
            id: executionId!,
            executionUpdatedAt: executionRef.current
              .updatedAt! as unknown as string,
          });

        if (response.data?.hasChanged) {
          await fetchExecutionUpdate({ isInitialCall: false });
        }
      }

      // After fetching data, wait for 2 seconds before fetching again
      if (
        executionRef.current?.status !== 'SUCCESS' &&
        executionRef.current?.status !== 'FAILED'
      ) {
        setTimeout(() => {
          setCallAgainCounter((prev) => prev + 1);
        }, 2000);
      }
    }
  }, [callAgainCounter, executionId, fetchExecutionUpdate]);

  useEffect(() => {
    if (
      callAgainCounter > 0 &&
      executionRef.current?.status !== 'SUCCESS' &&
      executionRef.current?.status !== 'FAILED'
    ) {
      checkIfExecutionUpdatedAtHasChanged();
    }
  }, [callAgainCounter, checkIfExecutionUpdatedAtHasChanged]);

  useEffect(() => {
    //1. Fetch the execution first, so you get the updatedAt field.
    //   1.a This initial call won't trigger the node rerender in the reactflow component.
    //   1.b All subsequent calls will trigger the node rerender. They're only called when the updatedAt field changes.
    //2. Then start checking if the updatedAt field has changes
    //   2.a This will just call itself every 2 seconds.
    //   2.b If the updatedAt field has changed, it will fetch the execution again.
    //   2.c It will repeat indefinitely. But the payload is small and it's an easy date search so it's okay.
    fetchExecutionUpdate({ isInitialCall: true }).then(() => {
      checkIfExecutionUpdatedAtHasChanged();
    }); // Start the initial fetch

    //Only running this once, so no dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}

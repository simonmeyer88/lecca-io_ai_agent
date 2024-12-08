import { useMemo } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';

import useApiQuery from '@/api/use-api-query';
import { useProjectWorkflow } from '@/hooks/useProjectWorkflow';

import { NodeStatus, getNodeStatus } from '../nodes/node-utils';

export function useGetNodeStatus({
  node,
  executionId,
  projectId,
}: {
  node: NodeProps;
  executionId: string | undefined;
  projectId: string;
}) {
  const { rerenderKey } = useProjectWorkflow();
  const { getNode, getNodes, getEdges } = useReactFlow();
  const { data: connections } = useApiQuery({
    service: 'connections',
    method: 'getList',

    apiLibraryArgs: {},
    /**
     * The reason below is commented out is because I don't want to make all of the connection calls for each node app type.
     * I'd rather reuse this common getList connections call to validate that those connections still exist.
     * We don't need to check that the connection exists for the specific app because it it didn't exist, it couldn't have been added
     * because the connection-form-field.tsx file filters by the workflowAppId. So the only way a connection would not exist, is it was deleted.
     *
     */
    // apiLibraryArgs: {
    //   config: {
    //     params: {
    //       filterBy: [
    //         `workflowAppId:${workflowApp.id}`,
    //         `projectAccessId:${projectId}`,
    //       ],
    //     },
    //   },
    // },
  });

  const { data: variables } = useApiQuery({
    service: 'variables',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${projectId}`],
        },
      },
    },
  });

  const nodeStatus = useMemo((): {
    status: NodeStatus;
    isComplete: boolean;
    messages: string[];
  } => {
    if (executionId) {
      const { executionStatus, executionStatusMessage } = node.data;

      let status = 'unknown';
      if (executionStatus === 'SUCCESS') {
        status = 'good';
      } else if (executionStatus === 'FAILED') {
        status = 'error';
      } else if (executionStatus === 'NEEDS_INPUT') {
        status = 'needsInput';
      } else if (executionStatus === 'SCHEDULED') {
        status = 'scheduled';
      } else if (executionStatus === 'RUNNING') {
        status = 'running';
      } else {
        if (status != null) {
          status = 'unknown';
        }
      }

      return {
        status: status as any,
        isComplete: true,
        messages: [executionStatusMessage],
      };
    } else {
      const status = getNodeStatus({
        node,
        connections: connections,
        nodes: getNodes(),
        edges: getEdges(),
        variables: variables,
      });

      return status;
    }

    /**
     * Added getNodes().length to to the dependency array to ensure that the nodeStatus is updated when the nodes are deleted
     * I wish there was one just for this specific node, but there isn't.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getNode,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    getNodes().length,
    rerenderKey,
    node.data?.value,
    connections,
    connections?.length,
    variables,
    variables?.length,
    executionId,
  ]);

  return { nodeStatus };
}

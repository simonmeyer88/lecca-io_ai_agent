/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';

import { api } from '@/api/api-library';
import useApiQuery from '@/api/use-api-query';
import { useToast } from '@/hooks/useToast';
import { Agent } from '@/models/agent/agent-model';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';
import { Workflow } from '@/models/workflow/workflow-model';
import { useUndoRedo } from '@/pages/projects/components/workflow/hooks/useUndoRedo';

type ProjectWorkflowContextProps = {
  workflowApps?: WorkflowApp[];
  workflowOrientation: 'HORIZONTAL' | 'VERTICAL';
  setWorkflowOrientation: React.Dispatch<
    React.SetStateAction<'HORIZONTAL' | 'VERTICAL'>
  >;
  mappedWorkflowApps?: { [key: string]: WorkflowApp };
  workflowAppsLoading: boolean;
  hasRenderedInitialData: boolean;
  setHasRenderedInitialData: React.Dispatch<React.SetStateAction<boolean>>;
  runSingleNode: (args: {
    nodeId: string;
    workflowId: string;
    shouldMock?: boolean;
    skipValidatingConditions?: boolean;
  }) => Promise<void>;
  saveWorkflow?: () => Promise<Workflow>;
  setSaveWorkflow: React.Dispatch<
    React.SetStateAction<(() => Promise<Workflow>) | undefined>
  >;
  saveAgent?: () => Promise<Agent>;
  setSaveAgent: React.Dispatch<
    React.SetStateAction<(() => Promise<Agent>) | undefined>
  >;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  rerenderKey: number;
  setRerenderKey: React.Dispatch<React.SetStateAction<number>>;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const ProjectWorkflowContext =
  React.createContext<ProjectWorkflowContextProps>({
    workflowApps: [],
    workflowOrientation: 'HORIZONTAL',
    setWorkflowOrientation: () => 'HORIZONTAL',
    workflowAppsLoading: true,
    mappedWorkflowApps: {},
    hasRenderedInitialData: false,
    setHasRenderedInitialData: () => true,
    runSingleNode: async () => {},
    saveWorkflow: async () => {
      return null as unknown as Workflow;
    },
    setSaveWorkflow: () => {},
    saveAgent: async () => {
      return null as unknown as Agent;
    },
    setSaveAgent: () => {},
    isSaving: false,
    setIsSaving: () => {},
    rerenderKey: 1,
    setRerenderKey: () => 1,
    undo: () => {},
    redo: () => {},
    takeSnapshot: () => {},
    canUndo: false,
    canRedo: false,
  });

export const ProjectWorkflowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setNodes } = useReactFlow();
  const [hasRenderedInitialData, setHasRenderedInitialData] =
    React.useState(false);
  const { toast } = useToast();
  const [saveWorkflow, setSaveWorkflow] = useState<() => Promise<Workflow>>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveAgent, setSaveAgent] = useState<() => Promise<Agent>>();
  const [rerenderKey, setRerenderKey] = useState(1);
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo();

  const [workflowOrientation, setWorkflowOrientation] = useState<
    'HORIZONTAL' | 'VERTICAL'
  >('HORIZONTAL');

  const { data: workflowApps, isLoading: workflowAppsLoading } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
    reactQueryArgs: {
      queries: {
        staleTime: 1000 * 60 * 60, //60 minutes
      },
    },
  });

  const runSingleNode = async ({
    nodeId,
    workflowId,
    shouldMock,
    skipValidatingConditions,
  }: {
    nodeId: string;
    workflowId: string;
    shouldMock?: boolean;
    skipValidatingConditions?: boolean;
  }) => {
    setIsSaving(true);

    const { data, error } = await api.workflowApps.runNode({
      workflowId: workflowId!,
      nodeId: nodeId,
      shouldMock,
      skipValidatingConditions,
    });

    if (error) {
      toast({
        title: error,
        variant: 'destructive',
      });
    } else if (data) {
      if (data.success) {
        setNodes((nodes) => {
          const updatedNodes = nodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  output: data.success,
                },
              };
            }
            return n;
          });

          return updatedNodes;
        });

        if (saveWorkflow) {
          //Because we're going to save this workflow after we receive an output. To save the output to the node
          //Or else after they hit Generate Output, they'll have to hit save again to save the output which is annoying
          await saveWorkflow();

          toast({
            title: 'Test completed successfully',
          });
        }
      } else if (data.failure) {
        setNodes((nodes) => {
          const updatedNodes = nodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  output: { failure: data.failure },
                },
              };
            }
            return n;
          });

          return updatedNodes;
        });

        if (saveWorkflow) {
          //Because we're going to save this workflow after we receive an output. To save the output to the node
          //Or else after they hit "Generate Output", they'll have to hit save again to save the output which is annoying
          await saveWorkflow();

          toast({
            title: 'Test completed with errors',
            description: 'Check the output of the node for more information',
            variant: 'destructive',
          });
        }
      } else if (data.conditionsMet === false) {
        toast({
          title: 'Validation Did Not Pass',
          variant: 'warning',
        });
      } else {
        //This means no data was returned from the trigger node response.
        //Because the trigger node returns the [0]th index of the output
        //but if there's no data, then success returns undefined.

        //So we will return that the test was successful, even though it had no data
        setNodes((nodes) => {
          const updatedNodes = nodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  output: data.success,
                },
              };
            }
            return n;
          });

          return updatedNodes;
        });

        if (saveWorkflow) {
          await saveWorkflow();

          toast({
            title: 'Test completed successfully with no data',
          });
        }
      }
    }

    setIsSaving(false);
  };

  const mappedWorkflowApps = React.useMemo(() => {
    if (!workflowApps) {
      return {};
    }

    return workflowApps.reduce(
      (acc, app) => {
        acc[app.id] = app;
        return acc;
      },
      {} as { [key: string]: WorkflowApp },
    );
  }, [workflowApps]);

  return (
    <ProjectWorkflowContext.Provider
      value={{
        workflowOrientation,
        setWorkflowOrientation,
        workflowApps,
        workflowAppsLoading,
        mappedWorkflowApps,
        hasRenderedInitialData,
        setHasRenderedInitialData,
        runSingleNode,
        setSaveWorkflow,
        saveWorkflow,
        setSaveAgent,
        saveAgent,
        isSaving,
        setIsSaving,
        rerenderKey,
        setRerenderKey,
        undo,
        redo,
        takeSnapshot,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </ProjectWorkflowContext.Provider>
  );
};

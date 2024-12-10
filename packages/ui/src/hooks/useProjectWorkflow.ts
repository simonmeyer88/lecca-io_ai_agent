import { useContext } from 'react';

import { ProjectWorkflowContext } from '../providers/project-workflow-provider/project-workflow-provider';

export const useProjectWorkflow = () => useContext(ProjectWorkflowContext);

import { useContext } from 'react';

import { ProjectAgentContext } from '../providers/project-agent-provider/project-agent-provider';

export const useProjectAgent = () => useContext(ProjectAgentContext);

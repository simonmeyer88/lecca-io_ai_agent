import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { Loader } from '../../components/loaders/loader';

/**
 * This page fetches the agent and then redirects to the project agent details page.
 */

export function AgentDetailsPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { data: agent, isLoading: isLoadingAgent } = useApiQuery({
    service: 'agents',
    method: 'getById',
    apiLibraryArgs: {
      id: agentId!,
    },
  });

  useEffect(() => {
    if (!isLoadingAgent && agent) {
      navigate(`/projects/${agent.project?.id}/agents/${agent.id}`, {
        replace: true,
      });
    }
  }, [isLoadingAgent, navigate, agent]);

  return <Loader />;
}

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { Loader } from '../../components/loaders/loader';

/**
 * This page fetches the workflow and then redirects to the project workflow details page.
 */

export function WorkflowDetailsPage() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const { data: workflow, isLoading: isLoadingworkflow } = useApiQuery({
    service: 'workflows',
    method: 'getById',
    apiLibraryArgs: {
      id: workflowId!,
    },
  });

  useEffect(() => {
    if (!isLoadingworkflow && workflow) {
      navigate(`/projects/${workflow.project.id}/workflows/${workflow.id}`, {
        replace: true,
      });
    }
  }, [isLoadingworkflow, navigate, workflow]);

  return <Loader />;
}

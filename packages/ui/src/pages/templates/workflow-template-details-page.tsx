import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { Loader } from '../../components/loaders/loader';

/**
 * This page fetches the agent and then redirects to the project agent details page.
 */

export function WorkflowTemplateDetailsPage() {
  const { workflowTemplateId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery({
    service: 'workflowTemplates',
    method: 'getById',
    apiLibraryArgs: {
      id: workflowTemplateId!,
    },
  });

  useEffect(() => {
    if (!isLoading && data) {
      navigate(`/projects/${data.project?.id}/workflow-templates/${data.id}`, {
        replace: true,
      });
    }
  }, [isLoading, navigate, data]);

  return <Loader />;
}

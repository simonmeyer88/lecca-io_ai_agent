import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { Loader } from '../../components/loaders/loader';

/**
 * This page fetches the agent and then redirects to the project agent details page.
 */

export function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading: isLoadingTask } = useApiQuery({
    service: 'tasks',
    method: 'getById',
    apiLibraryArgs: {
      id: taskId!,
    },
  });

  useEffect(() => {
    if (!isLoadingTask && task) {
      navigate(
        `/projects/${task.agent?.project?.id}/agents/${task.agent?.id}/tasks/${task.id}`,
        {
          replace: true,
        },
      );
    }
  }, [isLoadingTask, navigate, task]);

  return <Loader />;
}

import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { Icons } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { ComboBox } from '../../../../components/ui/combo-box';

export function NavProjectSelector() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { data, isLoading } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  if (!projectId) {
    return null;
  }

  if (isLoading) {
    return <Icons.spinner className="animate-spin size-4 mx-1 ml-2" />;
  }

  return (
    <ComboBox
      items={data?.map((project) => ({
        value: project.id,
        label: project.name,
      }))}
      defaultSelectedItem={{
        label:
          data?.find((project) => project.id === projectId)?.name ??
          'Current Project',
        value: projectId!,
      }}
      trigger={
        <Button variant="ghost" className="size-7 p-1">
          <Icons.caretSort className="size-10" />
        </Button>
      }
      searchLabel="Search projects..."
      onChange={(value) => navigate(`/projects/${value}`)}
    />
  );
}

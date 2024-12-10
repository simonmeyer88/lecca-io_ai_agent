import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { Icons } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { ComboBox } from '../../../../components/ui/combo-box';

export function NavKnowledgeSelector() {
  const navigate = useNavigate();
  const { knowledgeId } = useParams();
  const { data, isLoading } = useApiQuery({
    service: 'knowledge',
    method: 'getList',
    apiLibraryArgs: {},
  });

  if (!knowledgeId) {
    return null;
  }

  if (isLoading) {
    return <Icons.spinner className="animate-spin size-4 mx-1 ml-2" />;
  }

  return (
    <ComboBox
      items={data?.map((knowledge) => ({
        value: knowledge.id,
        label: knowledge.name,
      }))}
      toggle
      defaultSelectedItem={{
        label:
          data?.find((knowledge) => knowledge.id === knowledgeId)?.name ??
          'Current Notebook',
        value: knowledgeId!,
      }}
      trigger={
        <Button variant="ghost" className="size-7 p-1">
          <Icons.caretSort className="size-10" />
        </Button>
      }
      searchLabel="Search notebooks..."
      onChange={(value) => navigate(`/knowledge/${value}`)}
    />
  );
}

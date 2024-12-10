import Autoplay from 'embla-carousel-autoplay';

import useApiQuery from '../../../api/use-api-query';
import { Carousel } from '../../../components/ui/carousel';
import { WorkflowTemplateCard } from '../../templates/workflow-templates-page';

export function TemplateCarousel() {
  const { data: apps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: templates } = useApiQuery({
    service: 'workflowTemplates',
    method: 'getSharedList',
    apiLibraryArgs: {
      config: {
        sharedToType: 'global',
      },
    },
  });
  //   const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  return (
    <Carousel
      //   setApi={setCarouselApi}
      opts={{
        loop: true,
      }}
      plugins={[Autoplay() as any]}
      className="w-full sm:w-[calc(100%-50px)]"
    >
      <Carousel.Content>
        {templates?.length &&
          apps &&
          templates.map((template) => (
            <Carousel.Item
              key={template.id}
              className="md:basis-1/2 xl:basis-1/3 2xl:basis-1/4 3xl:basis-1/5"
            >
              <WorkflowTemplateCard
                apps={apps}
                sharedToType="global"
                canShareToPublic={false}
                canShareToWorkspace={false}
                setRefetchTrigger={() => {
                  //
                }}
                template={template}
                className="h-48"
              />
            </Carousel.Item>
          ))}
      </Carousel.Content>
      <Carousel.Previous className="hidden sm:flex" />
      <Carousel.Next className="hidden sm:flex" />
    </Carousel>
  );
}

import { Card } from '@/components/ui/card';
import { Carousel } from '@/components/ui/carousel';
import { YoutubeIframe } from '@/components/youtube-iframe';

type LearningItem = {
  title: string;
  description: string;
  url: string;
};

const learningItems: LearningItem[] = [
  {
    title: 'Understanding Projects in Lecca.io',
    description: 'Get an overview of projects and how to manage them.',
    url: 'https://www.youtube.com/embed/JwE3L8tmpJI?si=e84DZqRZPF9jHIkN',
  },
  {
    title: 'Creating your first connection',
    description: 'Integrate with your favorite apps in seconds',
    url: 'https://www.youtube.com/embed/b83bJYakaR8?si=5d5fl0sok1imQFC_',
  },
  {
    title: 'Getting Started with Workflows',
    description: 'Learn how to create and manage automation workflows',
    url: 'https://www.youtube.com/embed/csDLgJSMg-A?si=1c1zBpdwo4peTX7y',
  },
  {
    title: 'Build your first AI Agent',
    description: 'It just takes a few minutes to build your first AI agent',
    url: 'https://www.youtube.com/embed/kBk-swoAkY8?si=eVBmxzN0w_KVW22_',
  },
  {
    title: 'Create a Knowledge Notebook',
    description: 'Upload data and use it with your AI agents',
    url: 'https://www.youtube.com/embed/2V7A3IpyJbo?si=4RUriV0AB5bevQy1',
  },
  {
    title: 'Variables in your Workflows',
    description: 'Reuse values across your workflows',
    url: 'https://www.youtube.com/embed/TJEL2m7u07s?si=VG4_4tyZ0ng9bIWd',
  },
  {
    title: 'View and manage workflow executions',
    description: 'Troubleshoot, view logs, and interact with executions.',
    url: 'https://www.youtube.com/embed/1z6J5oMrd8I?si=3JFrUcnNeH4du-vn&amp;start=228',
  },
];

export function LearningContentCarousel() {
  return (
    <Carousel opts={{}} className="w-full sm:w-[calc(100%-50px)]">
      <Carousel.Content>
        {learningItems.map((item) => (
          <Carousel.Item
            key={item.url}
            className="md:basis-1/2 xl:basis-1/2 2xl:basis-1/3 3xl:basis-1/4"
          >
            <LearningContentCard item={item} />
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous className="hidden sm:flex" />
      <Carousel.Next className="hidden sm:flex" />
    </Carousel>
  );
}

const LearningContentCard = ({ item }: { item: LearningItem }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{item.title}</Card.Title>
        <Card.Description>{item.description}</Card.Description>
      </Card.Header>

      <Card.Content>
        <YoutubeIframe src={item.url} />
      </Card.Content>
    </Card>
  );
};

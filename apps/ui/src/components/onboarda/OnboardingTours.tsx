import { Icons } from '../icons';
import { Card } from '../ui/card';
import { YoutubeIframe } from '../youtube-iframe';

import { Tour } from './types';

export const tours: Tour[] = [
  {
    tour: 'application-overview',
    steps: [
      {
        icon: <Icons.dashboard className="inline mb-0.5 mr-1" />,
        title: 'Overview',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              The Overview page gives you an insight into your workspace.
              <br />
              <br />
              You can view recent workflows you've worked on, how many many
              projects, active workflows, and agents.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step1',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.project className="inline mb-0.5 size-4 mr-1" />,
        title: 'Projects',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Projects are a way to organize your agents and workflows.
              <br />
              <br />
              You can also create Connections, Knowledge Notebooks, and
              Variables within a project.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/JwE3L8tmpJI?si=e84DZqRZPF9jHIkN" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step2',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.workflow className="inline mb-0.5 size-4 mr-1" />,
        title: 'Workflows',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Workflows are a sequence of tasks that are executed in a specific
              order.
              <br />
              <br />
              You can configure triggers so they run automatically, on a
              schedule, or manually.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/csDLgJSMg-A?si=1c1zBpdwo4peTX7y" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step3',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.agent className="inline mb-0.5 size-4 mr-1" />,
        title: 'Agents',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Agents can search the web, send emails, create calendar events,
              and more.
              <br />
              <br />
              They use the connections and actions you configure to perform
              tasks given to them.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/kBk-swoAkY8?si=eVBmxzN0w_KVW22_" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step4',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.knowledge className="inline mb-0.5 size-4 mr-1" />,
        title: 'Knowledge',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Knowledge notebooks are used to store custom data.
              <br />
              <br />
              Upload a file, paste some text, and let your Agents use to data to
              accomplish their tasks.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/2V7A3IpyJbo?si=4RUriV0AB5bevQy1" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step5',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.link className="inline mb-0.5 size-4 mr-1" />,
        title: 'Connections',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Connect to your favorite apps.
              <br />
              <br />
              Once connected to your apps, you can use their actions in your
              workflows or give your AI Agents permission to perform these
              actions for you.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/b83bJYakaR8?si=5d5fl0sok1imQFC_" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step6',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.braces className="inline mb-0.5 size-4 mr-1" />,
        title: 'Variables',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Create reusable values.
              <br />
              <br />
              Reuse common text, numbers, booleans, and dates within your
              workflows.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/TJEL2m7u07s?si=VG4_4tyZ0ng9bIWd" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step7',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.chat className="inline mb-0.5 size-4 mr-1" />,
        title: 'Conversations',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              You can message your agents, other agents can message eachother,
              and workflows can also pass messages to agents.
              <br />
              <br />
              This helps manage all the conversations happening.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step8',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.executions className="inline mb-0.5 size-4 mr-1" />,
        title: 'Executions',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              When you're workflows run, you can view them here.
              <br />
              <br />
              You'll be reviewing executions if a workflow requires human input
              or if you need to troubleshoot a workflow.
              <br />
              <br />
              <YoutubeIframe src="https://www.youtube.com/embed/1z6J5oMrd8I?si=3JFrUcnNeH4du-vn&amp;start=228" />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step9',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.users className="inline mb-0.5 size-4 mr-1" />,
        title: 'Team',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Invite your team members to join your workspace
              <br />
              <br />
              You must be a workspace Maintainer and your workspace must be at
              least on the Team plan to invite team members.
              <br />
              <br />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step10',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.app className="inline mb-0.5 size-4 mr-1" />,
        title: 'Apps',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              View our collections of apps you can integrate with.
              <br />
              <br />
              If you do not see an app you need, please reach out to our team.
              <br />
              <br />
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step11',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.app className="inline mb-0.5 size-4 mr-1" />,
        title: 'Templates',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Use our pre-built templates to get started quickly.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step12',
        side: 'right-top',
        pointerPadding: 0,
      },
      {
        icon: <Icons.creditCard className="inline mb-0.5 size-4 mr-1" />,
        title: 'Credit Usage',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              View your credit usage in detail.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-step13',
        side: 'right-top',
        pointerPadding: 0,
      },
    ],
  },
  {
    tour: 'agents-overview',
    steps: [
      {
        icon: <Icons.agent className="inline mb-0.5 mr-1" />,
        title: 'Agent Profile',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Configure the name, description, web & phone access, and
              instructions of your agent.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-profile-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
      {
        icon: <Icons.knowledge className="inline mb-0.5 mr-1" />,
        title: 'Knowledge',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Give your Agent access to knowledge notebooks.
              <br />
              <br />
              This allows them to search through vasts amount of custom data to
              better assist you.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-knowledge-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
      {
        icon: <Icons.link className="inline mb-0.5 mr-1" />,
        title: 'Connections',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Enable access to your integrations.
              <br />
              <br />
              Once you have enabled a connection, you can enable pre-built
              actions in the <strong>Actions</strong> tab.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-connections-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
      {
        icon: <Icons.app className="inline mb-0.5 mr-1" />,
        title: 'Actions',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Enable pre-built actions for you Agent.
              <br />
              <br />
              Once your agent has access to some actions, you can prompt it to
              perform those actions via chat or through the{' '}
              <strong>Message Agent</strong> action in the{' '}
              <strong>Workflow Builder</strong>.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-actions-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
      {
        icon: <Icons.workflow className="inline mb-0.5 mr-1" />,
        title: 'Workflows',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Workflows are pre-built sequences of actions that your agent can
              use as tools.
              <br />
              <br />
              For a workflow to be available to an agent, it must have a trigger
              of <strong>Manually Run</strong>. And if you want the workflow to
              return a response to the Agent, you must use the{' '}
              <strong>Output Workflow Data</strong> action in the workflow.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-workflows-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
      {
        icon: <Icons.agent className="inline mb-0.5 mr-1" />,
        title: 'Sub-Agents',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Allow your Agent to message sub-agents.
              <br />
              <br />
              To avoid giving a single Agent too many tools or complicated its
              instructions, you can let your Agent delegate tasks to other
              Agents.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-sub-agents-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
      {
        icon: <Icons.gear className="inline mb-0.5 mr-1 size-5" />,
        title: 'Advanced Settings',
        content: (
          <div className="flex flex-col">
            <Card.Description className="text-primary">
              Specify the LLM Model, tweak the model's settings, and more.
              <br />
              <br />
              You can also select your OpenAI connection (must create one first)
              to use your own API Key.
            </Card.Description>
          </div>
        ),
        selector: '#onboarding-agent-advanced-tab',
        side: 'bottom-left',
        pointerPadding: 0,
      },
    ],
  },
];

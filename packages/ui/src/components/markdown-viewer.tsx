import { ElementType, ReactNode, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula as darkTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useUser } from '@/hooks/useUser';
import { cn } from '@/utils/cn';

import { Icons } from './icons';
import { Button } from './ui/button';

// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const MarkdownViewer = ({
  children,
  className,
}: {
  children?: string;
  className?: string;
}) => {
  const { workspaceUserPreferences: userPreferences } = useUser();

  const isDarkMode = useMemo(() => {
    if (userPreferences?.theme) {
      if (userPreferences.theme === 'DARK') {
        return true;
      } else if (userPreferences.theme === 'LIGHT') {
        return false;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    } else {
      return false;
    }
  }, [userPreferences?.theme]);

  return (
    <ReactMarkdown
      components={{
        a: (props) => {
          return (
            <a
              href={props.href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {props.children}
            </a>
          );
        },
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [isCopied, setIsCopied] = useState(false);

          const handleCopy = () => {
            copyToClipboard(String(children).replace(/\n$/, ''));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1500); // Reset after 1.5 seconds
          };

          return !inline && match ? (
            <div className="relative rounded-lg">
              <SyntaxHighlighter
                style={isDarkMode ? darkTheme : lightTheme}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  paddingTop: '55px',
                  margin: 0,
                  borderRadius: '10px',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>

              <div className="absolute w-full border-b top-0 bg-muted flex items-center justify-between rounded-t-lg">
                {' '}
                <span className="px-2 py-1 text-xs uppercase">{match[1]}</span>
                <Button
                  variant={'ghost'}
                  onClick={handleCopy}
                  tabIndex={0}
                  size={'sm'}
                  className="p-2 h-6 text-xs space-x-1 flex m-2"
                >
                  {isCopied ? (
                    <Icons.check className="size-3" />
                  ) : (
                    <Icons.copy className="size-3" />
                  )}
                  {isCopied ? <span>Copied!</span> : <span>Copy</span>}
                </Button>
              </div>
            </div>
          ) : (
            <code className="bg-muted text-[13px] py-0.5 px-1 rounded-md">
              {children}
            </code>
          );
        },
        h1: ({ children }) => (
          <Header as="h1" className="text-3xl font-bold mb-6">
            {children}
          </Header>
        ),
        h2: ({ children }) => (
          <Header as="h2" className="text-2xl font-bold mb-5">
            {children}
          </Header>
        ),
        h3: ({ children }) => (
          <Header as="h3" className="text-xl font-semibold mb-4">
            {children}
          </Header>
        ),
        h4: ({ children }) => (
          <Header as="h4" className="text-lg font-semibold mb-3">
            {children}
          </Header>
        ),
        h5: ({ children }) => (
          <Header as="h5" className="text-md font-medium mb-2">
            {children}
          </Header>
        ),
        h6: ({ children }) => (
          <Header as="h6" className="text-sm font-medium mb-1">
            {children}
          </Header>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-border pl-4 italic my-4">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc my-1 ml-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal my-1 ml-5 marker:tracking-tighter">
            {children}
          </ol>
        ),
        hr: () => <hr className="border-t border-border my-4" />,
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-200">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-300">{children}</tbody>
        ),
        tr: ({ children }) => <tr className="hover:bg-gray-100">{children}</tr>,
        th: ({ children }) => (
          <th className="border border-border px-4 py-2 text-left">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-2">{children}</td>
        ),
        p: ({ children }) => <p className="leading-relaxed my-2">{children}</p>,
      }}
      className={cn('text-sm leading-loose', className)}
    >
      {children}
    </ReactMarkdown>
  );
};

const Header = ({
  as: Tag,
  children,
  className,
}: {
  as: ElementType;
  children: ReactNode; // Update this from string to ReactNode
  className?: string;
}) => <Tag className={cn('mt-4', className)}>{children}</Tag>;

import { useMemo } from 'react';
import { JSONTree } from 'react-json-tree';

import { Icons } from '@/components/icons';
import { JsonViewer } from '@/components/json-viewer';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

export type OutputSelectorOnClickArgs = {
  path: any;
};

type OutputSelectorProps = {
  data: Record<string, any> | undefined;
  onClick?: (args: OutputSelectorOnClickArgs) => void;
  hideRoot?: boolean;
  keyNameDelimiter?: string;
};

const THEME = {
  scheme: 'custom-light',
  base00: '#ffffff', // white background
  base01: '#f5f5f5', // light grey for slightly darker elements
  base02: '#e5e5e5', // even darker grey for borders or separators
  base03: '#cccccc', // light grey for comments, invisibles, line highlighting
  base04: '#b3b3b3', // medium grey for dark text on a light background
  base05: '#333333', // dark grey text
  base06: '#292929', // slightly darker grey text
  base07: '#1a1a1a', // very dark grey text (almost black)
  base08: '#ff5f56', // red for errors
  base09: '#ffbd2e', // orange for warnings
  base0A: '#ffea00', // yellow for highlights
  base0B: '#333', // green for success
  base0C: '#2ecc71', // teal for info
  base0D: '#3498db', // blue for links and important elements
  base0E: '#9b59b6', // purple for accents
  base0F: '#e67e22', // orange for special elements
};

export function OutputSelector({
  data,
  onClick,
  hideRoot,
  keyNameDelimiter,
}: OutputSelectorProps) {
  const { workspaceUserPreferences: userPreferences } = useUser();
  const invertTheme = useMemo(() => {
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
    <div className="flex flex-col space-y-6 text-sm [&>ul]:!bg-transparent">
      {data ? (
        onClick ? (
          <JSONTree
            theme={THEME}
            invertTheme={invertTheme}
            data={data}
            hideRoot={hideRoot}
            labelRenderer={(keyPath, nodeType) => (
              <LabelRenderer
                nodeType={nodeType}
                keyPath={keyPath}
                keyNameDelimiter={keyNameDelimiter}
                onClick={onClick}
              />
            )}
            sortObjectKeys={true}
          />
        ) : (
          <JsonViewer data={data} />
        )
      ) : (
        <div className="text-sm text-gray-500">No output data</div>
      )}
    </div>
  );
}

export function LabelRenderer({
  keyPath,
  onClick,
  keyNameDelimiter,
}: {
  keyPath: any;
  nodeType: string;
  keyNameDelimiter?: string;
  onClick?: (args: OutputSelectorOnClickArgs) => void;
}) {
  const label = useMemo(() => {
    //This is for cases where we want to put data on the key, but we want to only use
    // //part of the key for the label. So key::label would be the key, but we only want the label
    if (keyNameDelimiter) {
      if (keyPath[0]) {
        //This may be a number if it's an array. In which case it can't be split
        if (keyPath[0].split) {
          if (keyPath[0].split(keyNameDelimiter).length > 1) {
            return keyPath[0].split(keyNameDelimiter)[1];
          }
        }
      }
    }

    return keyPath[0];
  }, [keyNameDelimiter, keyPath]);

  return onClick ? (
    <Button
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();

        onClick({ path: keyPath });
      }}
      className="p-0.5 h-5 group text-blue-500 hover:text-blue-500 border border-transparent hover:border-dashed  hover:border-blue-500 hover:bg-blue-500/10"
    >
      <span className="mr-0.5 opacity-0 group-hover:opacity-100">
        <Icons.plus className="size-2" />
      </span>
      {label}
    </Button>
  ) : (
    <span>{label}</span>
  );
}

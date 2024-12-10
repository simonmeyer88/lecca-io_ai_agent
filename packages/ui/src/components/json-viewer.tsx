import { useMemo } from 'react';
import { JSONTree } from 'react-json-tree';

import { useUser } from '../hooks/useUser';

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

export function JsonViewer({
  data,
  shouldExpandNodeInitially,
  shouldSortObjectKeys,
}: {
  data: any;
  shouldExpandNodeInitially?: () => boolean;
  shouldSortObjectKeys?: boolean;
}) {
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
    <JSONTree
      theme={THEME}
      invertTheme={invertTheme}
      data={data}
      shouldExpandNodeInitially={shouldExpandNodeInitially}
      hideRoot={true}
      sortObjectKeys={shouldSortObjectKeys}
    />
  );
}

/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

type ApplicationSideNavContextProps = {
  isCollapsed: boolean;
  rightRailIsCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  setRightRailIsCollapsed: (isCollapsed: boolean) => void;
};

export const ApplicationSideNavContext =
  React.createContext<ApplicationSideNavContextProps>({
    isCollapsed: false,
    rightRailIsCollapsed: false,
    setIsCollapsed: () => {},
    setRightRailIsCollapsed: () => {},
  });

export const ApplicationSideNavProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(
    window.innerWidth < 1280,
  );

  const [rightRailIsCollapsed, setRightRailIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCollapsed((collapsed) => !collapsed);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  //Add react use effect when window width changes below 968px
  React.useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <ApplicationSideNavContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        rightRailIsCollapsed,
        setRightRailIsCollapsed,
      }}
    >
      {children}
    </ApplicationSideNavContext.Provider>
  );
};

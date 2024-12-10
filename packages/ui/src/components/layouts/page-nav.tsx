import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../../utils/cn';
import { Icons } from '../icons';
import { Breadcrumb } from '../ui/breadcrumb';
import { Button } from '../ui/button';
import { DropdownMenu } from '../ui/dropdown-menu';
import { Input } from '../ui/input';

export type Breadcrumbs = {
  label: string;
  href: string;
  additionalButton?: React.ReactNode;
}[];

export default function PageNav({
  title,
  titleButton,
  editableTitleDefaultValue,
  onTitleChange,
  subtitle,
  defaultIsEditingTitle,
  actions,
  breadcrumbs,
  className,
}: {
  title?: string;
  titleButton?: React.ReactNode;
  subtitle?: string;
  defaultIsEditingTitle?: boolean;
  editableTitleDefaultValue?: string;
  onTitleChange?: (title: string) => void;
  actions?: React.ReactNode[];
  breadcrumbs?: Breadcrumbs;
  className?: string;
}) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(
    defaultIsEditingTitle ?? false,
  );
  const [tempTitle, setTempTitle] = React.useState(
    editableTitleDefaultValue ?? '',
  );

  useEffect(() => {
    setTempTitle(editableTitleDefaultValue ?? '');
  }, [editableTitleDefaultValue]);

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between sm:space-y-0 space-y-2 px-2 sm:px-5 sm:pt-4 pb-2',
        className,
      )}
    >
      <div className="flex space-x-10 items-center">
        <div className="space-y-0.5">
          <Breadcrumb>
            <Breadcrumb.List>
              {breadcrumbs?.map((breadcrumb, i) => (
                <React.Fragment key={i}>
                  <Breadcrumb.Item className="hidden lg:flex">
                    <Breadcrumb.Link asChild>
                      <Link
                        to={breadcrumb.href}
                        className="text-primary hover:underline"
                      >
                        {breadcrumb.label}
                      </Link>
                    </Breadcrumb.Link>
                    {breadcrumb.additionalButton}
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator className="hidden lg:flex" />
                </React.Fragment>
              ))}
              <Breadcrumb.Item>
                <Breadcrumb.Page>
                  {isEditingTitle &&
                  editableTitleDefaultValue &&
                  onTitleChange ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={tempTitle}
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onTitleChange(tempTitle);
                            setIsEditingTitle(false);
                          }
                        }}
                        className="text-lg font-bold"
                      />
                      <Button
                        onClick={() => {
                          onTitleChange(tempTitle);
                          setIsEditingTitle(false);
                        }}
                        className="size-6 p-1"
                        variant="ghost"
                      >
                        <Icons.check />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <h2 className="text-xl font-bold line-clamp-1">
                        {title ?? editableTitleDefaultValue ?? 'Untitled'}
                      </h2>
                      {titleButton}
                      {editableTitleDefaultValue && onTitleChange && (
                        <Button
                          onClick={() => {
                            setIsEditingTitle(true);
                          }}
                          className="size-6 p-1 mt-0.5"
                          variant="ghost"
                        >
                          <Icons.pencil />
                        </Button>
                      )}
                    </div>
                  )}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex space-x-4"></div>
      </div>
      <div className="hidden sm:flex items-center space-x-4">
        {actions?.map((action, i) => (
          <React.Fragment key={i}>{action}</React.Fragment>
        ))}
      </div>
      {actions?.length != null && actions.length > 0 && (
        <DropdownMenu>
          <DropdownMenu.Trigger className="block sm:hidden" asChild>
            <Button variant="outline">
              <Icons.dotsHorizontal />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item></DropdownMenu.Item>
            {actions?.map((action, i) => (
              <DropdownMenu.Item key={i}>{action}</DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
}

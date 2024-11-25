import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const CollapsibleRoot = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export const Collapsible = CollapsibleRoot as typeof CollapsibleRoot & {
  Trigger: typeof CollapsibleTrigger;
  Content: typeof CollapsibleContent;
};

Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Content = CollapsibleContent;

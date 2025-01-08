import { Icons } from '../../../../../../../components/icons';
import { Form } from '../../../../../../../components/ui/form';
import { Tooltip } from '../../../../../../../components/ui/tooltip';
import { cn } from '../../../../../../../utils/cn';

export const SharedLabelAndTooltip = ({
  label,
  required,
  description,
  small,
  delayDuration,
  className,
  hideTooltip,
  requiredForAgent,
}: {
  label: string;
  required?: boolean;
  description: string;
  small?: boolean;
  delayDuration?: number;
  className?: string;
  hideTooltip?: boolean;
  requiredForAgent?: boolean;
}) => {
  return (
    <Form.Label
      className={cn('flex items-center ml-1', className, {
        'text-muted-foreground': small,
      })}
      aria-required={required}
    >
      {label}
      {required && <span className="text-muted-foreground ml-1">*</span>}
      {!hideTooltip && description.length !== 0 && (
        <Tooltip delayDuration={delayDuration}>
          <Tooltip.Trigger onClick={(e) => e.preventDefault()}>
            <Icons.infoCircle className="text-muted-foreground size-3 ml-2" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p className={cn('max-w-[400px]')}>{description}</p>
          </Tooltip.Content>
        </Tooltip>
      )}
      {requiredForAgent !== undefined ? (
        requiredForAgent ? (
          <Tooltip delayDuration={delayDuration}>
            <Tooltip.Trigger onClick={(e) => e.preventDefault()}>
              <Icons.agent className="text-red-500 size-4 ml-2 animate-pulse" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p className={cn('max-w-[400px]')}>
                Agent's cannot fill out this input field. Please provide all
                necessary values. If you want the values to be more dynamic
                based on certain data, consider building a workflow tool where
                you can pass data from one action to another.
              </p>
            </Tooltip.Content>
          </Tooltip>
        ) : // <Tooltip delayDuration={delayDuration}>
        //   <Tooltip.Trigger onClick={(e) => e.preventDefault()}>
        //     <Icons.agent className="text-blue-400 size-4 ml-2" />
        //   </Tooltip.Trigger>
        //   <Tooltip.Content>
        //     <p className={cn('max-w-[400px]')}>
        //       Agents will fill out this field if left empty.
        //     </p>
        //   </Tooltip.Content>
        // </Tooltip>
        //This doesn't look very good, so I'm going to remove it for now
        null
      ) : null}
    </Form.Label>
  );
};

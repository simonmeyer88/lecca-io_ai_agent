import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { appQueryClient } from '../../../../api/api-library';
import useApiQuery from '../../../../api/use-api-query';
import { Icons } from '../../../../components/icons';
import { DateRangePicker } from '../../../../components/ui/date-range-picker';
import { HomeSummaryCard } from '../home-summary-card';

const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(),
  to: new Date(),
};

export function ExecutionsSummaryCard() {
  const { data: executions, isLoading: isLoadingExecutions } = useApiQuery({
    service: 'executions',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    DEFAULT_DATE_RANGE,
  );

  useEffect(() => {
    //TODO: For better performance, add the date range to the query key. We would need to add that to the useApiQuery hook as well.
    appQueryClient.cancelQueries({ queryKey: ['executions', 'getList'] });
    appQueryClient.invalidateQueries({
      queryKey: ['executions', 'getList'],
    });
  }, [dateRange]);

  return (
    <HomeSummaryCard
      title="Executions"
      value={executions?.length}
      Icon={Icons.executions}
      isLoading={isLoadingExecutions}
      summary={
        <DateRangePicker
          value={dateRange}
          placeholder="Select a date range"
          triggerClassName="px-0 h-2 border-none mt-2 pt-2 pb-2 text-xs hover:bg-transparent hover:underline"
          onChange={(val) => {
            setDateRange(val as DateRange | undefined);
          }}
        />
      }
    />
  );
}

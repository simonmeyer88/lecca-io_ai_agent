import { Link } from 'react-router-dom';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

import { HomeSummaryCard } from '../home-summary-card';

export function BillingSummaryCard() {
  return (
    <HomeSummaryCard
      title="Billing"
      value={'$23.50'}
      isLoading={false}
      Icon={Icons.dollarSign}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/billing">View billing & usage</Link>
        </Button>
      }
    />
  );
}

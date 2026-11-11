import { useState } from 'react';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateField } from '@/components/ui/DateField';
import { Numpad } from '@/components/ui/Numpad';
import { PaidCreditToggle } from '@/components/ui/PaidCreditToggle';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Toggle';
import { ponds } from '@/data/farm';
import { DevSection } from '@/pages/dev/DevSection';
import type { PaymentStatus } from '@/types';

export function DevForms() {
  const [tab, setTab] = useState<'all' | 'paid'>('all');
  const [pond, setPond] = useState('pond-1');
  const [date, setDate] = useState('2026-11-10');
  const [amount, setAmount] = useState('18400');
  const [paid, setPaid] = useState<PaymentStatus>('credit');
  const [on, setOn] = useState(true);
  const [chip, setChip] = useState('en');

  return (
    <>
      <DevSection title="Buttons">
        <div className="space-y-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </DevSection>

      <DevSection title="Chips & tabs">
        <div className="flex gap-2">
          <Chip selected={chip === 'en'} onClick={() => setChip('en')}>
            English
          </Chip>
          <Chip selected={chip === 'te'} onClick={() => setChip('te')}>
            తెలుగు
          </Chip>
        </div>
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'paid', label: 'Paid' },
          ]}
        />
        <PaidCreditToggle value={paid} onChange={setPaid} />
        <div className="flex items-center justify-between rounded-card bg-card px-4 py-3">
          <span className="text-body">Hide amounts</span>
          <Toggle checked={on} onChange={setOn} label="Hide amounts" />
        </div>
      </DevSection>

      <DevSection title="Fields">
        <TextField label="Farm name" placeholder="Sri Lakshmi Aqua Farm" defaultValue="" />
        <TextField label="Mobile" error="Enter a valid 10-digit number" defaultValue="98" />
        <SelectField
          label="Pond"
          value={pond}
          onChange={setPond}
          options={ponds.map((item) => ({ value: item.id, label: item.name }))}
        />
        <DateField label="Date" value={date} onChange={setDate} />
        <AmountInput value={amount} onChange={setAmount} />
      </DevSection>

      <DevSection title="Numpad">
        <Numpad
          onKey={(key) => setAmount((current) => `${current}${key}`)}
          onBackspace={() => setAmount((current) => current.slice(0, -1))}
        />
      </DevSection>
    </>
  );
}

import React, { useState, useEffect } from 'react';

export const DualInputItem = ({ 
  label, 
  valueAnnual, 
  onChangeAnnual 
}: { 
  label: string; 
  valueAnnual: number; 
  onChangeAnnual: (val: number) => void;
}) => {
  const [localMonthly, setLocalMonthly] = useState<string>((valueAnnual / 12).toFixed(0));
  const [localAnnual, setLocalAnnual] = useState<string>(valueAnnual.toString());

  useEffect(() => {
    // Only update local state if the external value differs significantly
    // to avoid overriding active typing. We'll check the parsed value.
    if (parseFloat(localAnnual) !== valueAnnual) {
      setLocalAnnual(valueAnnual.toString());
      setLocalMonthly(Math.round(valueAnnual / 12).toString());
    }
  }, [valueAnnual]);

  const handleMonthlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalMonthly(val);
    if (val === '') {
      setLocalAnnual('');
      onChangeAnnual(0);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const ann = num * 12;
      setLocalAnnual(ann.toString());
      onChangeAnnual(ann);
    }
  };

  const handleAnnualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalAnnual(val);
    if (val === '') {
      setLocalMonthly('');
      onChangeAnnual(0);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const mon = Math.round(num / 12);
      setLocalMonthly(mon.toString());
      onChangeAnnual(num);
    }
  };

  return (
    <div className="budget-row">
      <div className="budget-label">{label}</div>
      <div className="budget-input">
        <input type="number" value={localMonthly} onChange={handleMonthlyChange} placeholder="0" />
      </div>
      <div className="budget-input">
        <input type="number" value={localAnnual} onChange={handleAnnualChange} placeholder="0" />
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetDistributionFee, useGetAnnualMaintenanceFee, useSetDistributionFee, useSetAnnualMaintenanceFee } from '../hooks/useQueries';
import { Save } from 'lucide-react';

export default function AdminFeeManagement() {
  const { data: currentDistributionFee } = useGetDistributionFee();
  const { data: currentAnnualFee } = useGetAnnualMaintenanceFee();
  const setDistributionFee = useSetDistributionFee();
  const setAnnualMaintenanceFee = useSetAnnualMaintenanceFee();

  const [distributionFee, setDistributionFeeValue] = useState('');
  const [annualFee, setAnnualFeeValue] = useState('');

  const handleSaveDistributionFee = () => {
    const fee = parseInt(distributionFee);
    if (!isNaN(fee) && fee >= 0) {
      setDistributionFee.mutate(BigInt(fee));
      setDistributionFeeValue('');
    }
  };

  const handleSaveAnnualFee = () => {
    const fee = parseInt(annualFee);
    if (!isNaN(fee) && fee >= 0) {
      setAnnualMaintenanceFee.mutate(BigInt(fee));
      setAnnualFeeValue('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Distribution Fee</CardTitle>
          <CardDescription>Set the fee charged per song release</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₹{currentDistributionFee ? Number(currentDistributionFee) : 199}</span>
            <span className="text-muted-foreground">per release</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="distributionFee">New Distribution Fee (₹)</Label>
              <Input
                id="distributionFee"
                type="number"
                min="0"
                value={distributionFee}
                onChange={(e) => setDistributionFeeValue(e.target.value)}
                placeholder="Enter new fee"
              />
            </div>
            <Button
              onClick={handleSaveDistributionFee}
              disabled={!distributionFee || setDistributionFee.isPending}
              className="mt-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annual Maintenance Fee</CardTitle>
          <CardDescription>Set the annual maintenance fee for artists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₹{currentAnnualFee ? Number(currentAnnualFee) : 1000}</span>
            <span className="text-muted-foreground">per year</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="annualFee">New Annual Maintenance Fee (₹)</Label>
              <Input
                id="annualFee"
                type="number"
                min="0"
                value={annualFee}
                onChange={(e) => setAnnualFeeValue(e.target.value)}
                placeholder="Enter new fee"
              />
            </div>
            <Button
              onClick={handleSaveAnnualFee}
              disabled={!annualFee || setAnnualMaintenanceFee.isPending}
              className="mt-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

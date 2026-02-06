import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Save } from 'lucide-react';
import { useGetDistributionFee, useGetAnnualMaintenanceFee, useSetDistributionFee, useSetAnnualMaintenanceFee } from '../hooks/useQueries';

export default function AdminFeeManagement() {
  const { data: currentDistributionFee, isLoading: loadingDistribution } = useGetDistributionFee();
  const { data: currentAnnualFee, isLoading: loadingAnnual } = useGetAnnualMaintenanceFee();
  const setDistributionFee = useSetDistributionFee();
  const setAnnualMaintenanceFee = useSetAnnualMaintenanceFee();

  const [distributionFeeValue, setDistributionFeeValue] = useState('199');
  const [annualFeeValue, setAnnualFeeValue] = useState('1000');

  useEffect(() => {
    if (currentDistributionFee !== undefined) {
      setDistributionFeeValue(Number(currentDistributionFee).toString());
    }
  }, [currentDistributionFee]);

  useEffect(() => {
    if (currentAnnualFee !== undefined) {
      setAnnualFeeValue(Number(currentAnnualFee).toString());
    }
  }, [currentAnnualFee]);

  const handleSaveDistributionFee = () => {
    const fee = parseInt(distributionFeeValue, 10);
    if (!isNaN(fee) && fee >= 0) {
      setDistributionFee.mutate(fee);
    }
  };

  const handleSaveAnnualFee = () => {
    const fee = parseInt(annualFeeValue, 10);
    if (!isNaN(fee) && fee >= 0) {
      setAnnualMaintenanceFee.mutate(fee);
    }
  };

  const hasDistributionChanges = distributionFeeValue !== (currentDistributionFee ? Number(currentDistributionFee).toString() : '199');
  const hasAnnualChanges = annualFeeValue !== (currentAnnualFee ? Number(currentAnnualFee).toString() : '1000');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>Fee Management</CardTitle>
            <CardDescription>
              Configure distribution and annual maintenance fees for all artists
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distributionFee">Distribution Fee per Release (₹)</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="distributionFee"
                  type="number"
                  min="0"
                  value={distributionFeeValue}
                  onChange={(e) => setDistributionFeeValue(e.target.value)}
                  className="pl-8"
                  disabled={loadingDistribution}
                />
              </div>
              <Button
                onClick={handleSaveDistributionFee}
                disabled={!hasDistributionChanges || setDistributionFee.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {setDistributionFee.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This fee is charged for each song release submitted by artists.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualFee">Annual Maintenance Fee (₹)</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="annualFee"
                  type="number"
                  min="0"
                  value={annualFeeValue}
                  onChange={(e) => setAnnualFeeValue(e.target.value)}
                  className="pl-8"
                  disabled={loadingAnnual}
                />
              </div>
              <Button
                onClick={handleSaveAnnualFee}
                disabled={!hasAnnualChanges || setAnnualMaintenanceFee.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {setAnnualMaintenanceFee.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This fee is charged annually for data maintenance and platform services.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Current Distribution Fee:</strong> ₹{currentDistributionFee ? Number(currentDistributionFee) : 199}</p>
            <p><strong>Current Annual Maintenance Fee:</strong> ₹{currentAnnualFee ? Number(currentAnnualFee) : 1000}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


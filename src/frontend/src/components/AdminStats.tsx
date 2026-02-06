import { useGetAllSubmissions } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminStats() {
  const { data: submissions, isLoading } = useGetAllSubmissions();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  const total = submissions?.length || 0;
  const approved = submissions?.filter((s) => s.status === 'approved').length || 0;
  const pending = submissions?.filter((s) => s.status === 'pending').length || 0;
  const rejected = submissions?.filter((s) => s.status === 'rejected').length || 0;

  const stats = [
    {
      title: 'Total Submissions',
      value: total,
      icon: Music,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Approved',
      value: approved,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Review',
      value: pending,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? `${((stat.value / total) * 100).toFixed(1)}% of total` : 'No submissions yet'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

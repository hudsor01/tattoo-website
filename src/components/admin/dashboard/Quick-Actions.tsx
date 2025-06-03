import { PlusCircle, UserPlus, Calendar, Upload, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  color: 'red' | 'blue' | 'green' | 'purple';
  icon: React.ReactNode;
}

function QuickAction({ title, description, href, color, icon }: QuickActionProps) {
  const colorClasses = {
    red: 'border-slate-800 hover:border-red-600/50 hover:bg-red-900/20',
    blue: 'border-slate-800 hover:border-blue-600/50 hover:bg-blue-900/20',
    green: 'border-slate-800 hover:border-green-600/50 hover:bg-green-900/20',
    purple: 'border-slate-800 hover:border-purple-600/50 hover:bg-purple-900/20',
  };

  const iconClasses = {
    red: 'bg-red-900/50 text-red-400 group-hover:bg-red-900/70',
    blue: 'bg-blue-900/50 text-blue-400 group-hover:bg-blue-900/70',
    green: 'bg-green-900/50 text-green-400 group-hover:bg-green-900/70',
    purple: 'bg-purple-900/50 text-purple-400 group-hover:bg-purple-900/70',
  };

  return (
    <Link href={href} className="block">
      <div
        className={cn(
          'p-4 rounded-xl border bg-slate-900/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group cursor-pointer',
          colorClasses[color]
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-lg transition-all duration-300', iconClasses[color])}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function QuickActions() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg bg-slate-900 border border-slate-800 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2.5 bg-linear-to-tr from-purple-500 to-purple-600 rounded-xl shadow-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          Quick Actions
        </CardTitle>
        <CardDescription className="text-slate-400">Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3 h-full">
          <QuickAction
            title="Add Customer"
            description="Register new client profile"
            href="/admin/customers"
            color="blue"
            icon={<UserPlus className="h-5 w-5" />}
          />
          <QuickAction
            title="New Booking"
            description="Create new booking entry"
            href="/admin/bookings"
            color="green"
            icon={<Calendar className="h-5 w-5" />}
          />
          <QuickAction
            title="New Appointment"
            description="Schedule a new client session"
            href="/admin/appointments"
            color="purple"
            icon={<PlusCircle className="h-5 w-5" />}
          />
          <QuickAction
            title="Upload Image"
            description="Add new images to gallery"
            href="/admin/gallery"
            color="red"
            icon={<Upload className="h-5 w-5" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

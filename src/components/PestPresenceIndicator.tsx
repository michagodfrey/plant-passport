import { Badge } from '@/components/ui/badge';
import { Bug, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { Pest, PestPresence } from '@/types/database';

export interface PestPresenceIndicatorProps {
  pest: Pest;
  presence?: PestPresence;
  showDetails?: boolean;
  className?: string;
}

export function PestPresenceIndicator({ 
  pest, 
  presence, 
  showDetails = true,
  className = "" 
}: PestPresenceIndicatorProps) {
  const getPresenceStatus = () => {
    if (!presence) {
      return {
        status: 'absent' as const,
        label: 'Not present',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeVariant: 'secondary' as const
      };
    }
    
    if (presence.zoned) {
      return {
        status: 'zoned' as const,
        label: 'Zoned',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        badgeVariant: 'default' as const
      };
    }
    
    return {
      status: 'present' as const,
      label: 'Present',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badgeVariant: 'destructive' as const
    };
  };

  const status = getPresenceStatus();
  const StatusIcon = status.icon;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${status.bgColor} ${status.borderColor} ${className}`}>
      <div className="flex items-center gap-3">
        <Bug className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{pest.name}</p>
          {pest.acronym && showDetails && (
            <p className="text-xs text-muted-foreground">{pest.acronym}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
        <Badge variant={status.badgeVariant} className="text-xs">
          {status.label}
        </Badge>
      </div>
    </div>
  );
}

export interface PestPresenceListProps {
  pests: Pest[];
  pestPresence: PestPresence[];
  showSummary?: boolean;
  className?: string;
}

export function PestPresenceList({ 
  pests, 
  pestPresence, 
  showSummary = true,
  className = "" 
}: PestPresenceListProps) {
  const getPestPresence = (pestId: number) => {
    return pestPresence.find(p => p.pest_id === pestId);
  };

  const presentPests = pests.filter(pest => {
    const presence = getPestPresence(pest.pest_id);
    return presence && !presence.zoned;
  });

  const zonedPests = pests.filter(pest => {
    const presence = getPestPresence(pest.pest_id);
    return presence && presence.zoned;
  });

  const absentPests = pests.filter(pest => {
    const presence = getPestPresence(pest.pest_id);
    return !presence;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {showSummary && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-medium text-red-800">{presentPests.length}</p>
            <p className="text-xs text-red-600">Present</p>
          </div>
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-800">{zonedPests.length}</p>
            <p className="text-xs text-yellow-600">Zoned</p>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-medium text-green-800">{absentPests.length}</p>
            <p className="text-xs text-green-600">Absent</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {pests.map((pest) => (
          <PestPresenceIndicator
            key={pest.pest_id}
            pest={pest}
            presence={getPestPresence(pest.pest_id)}
          />
        ))}
      </div>
    </div>
  );
}

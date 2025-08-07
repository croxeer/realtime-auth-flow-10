import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CommunityGroup } from '@/lib/api';
import { Link } from 'react-router-dom';

export const GroupCard = ({ group }: { group: CommunityGroup }) => {
  return (
    <Link to={`/groups/${group.id}`}>
      <Card className="border-border/50 overflow-hidden">
        {group.coverUrl && (
          <img src={group.coverUrl} alt={group.name} className="h-24 w-full object-cover" />
        )}
        <CardContent className="p-4">
          <div className="font-semibold">{group.name}</div>
          {group.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">{group.description}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
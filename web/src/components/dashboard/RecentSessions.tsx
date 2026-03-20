import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining ? `${hrs}h ${remaining}m` : `${hrs}h`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentSessions() {
  const { sessions } = useDemo();
  const recent = sessions.slice(0, 5);

  return (
    <Card data-tour="recent-sessions">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Sessions</h3>
      <div className="space-y-3">
        {recent.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-primary truncate">{session.task}</div>
              <div className="text-xs text-text-secondary">
                {formatDate(session.createdAt)} &middot; {formatDuration(session.actualDuration)}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Badge variant="gold">+{session.xpEarned}</Badge>
              {session.shared && <Badge variant="accent">Shared</Badge>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

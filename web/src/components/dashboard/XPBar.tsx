import { useDemo } from '@/providers/DemoProvider';
import { getXpProgress, getLevelForXp } from '@shared/constants/xp';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';

export default function XPBar() {
  const { user } = useDemo();
  const level = getLevelForXp(user.totalXp);
  const xpProgress = getXpProgress(user.totalXp);

  return (
    <Card className="flex items-center gap-4" data-tour="xp-bar">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent/15 flex items-center justify-center">
          <span className="text-accent font-bold text-lg">{level.level}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">{level.name}</span>
          <Badge variant="gold">{user.totalXp} XP</Badge>
        </div>
        <ProgressBar progress={xpProgress.progress} color="bg-xp-gold" />
        <div className="text-xs text-secondary mt-1">
          {xpProgress.current} / {xpProgress.next} XP to Level {level.level + 1}
        </div>
      </div>
    </Card>
  );
}

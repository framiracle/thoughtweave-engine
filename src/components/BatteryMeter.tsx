import { cn } from "@/lib/utils";

interface BatteryMeterProps {
  label: string;
  percentage: number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "accent" | "destructive";
}

const BatteryMeter = ({ label, percentage, icon, color = "primary" }: BatteryMeterProps) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "secondary":
        return "bg-blue-500";
      case "accent":
        return "bg-green-500";
      case "destructive":
        return "bg-destructive";
      default:
        return "bg-primary";
    }
  };

  const getStatusColor = () => {
    if (clampedPercentage >= 70) return "text-green-500";
    if (clampedPercentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className={cn("font-medium", getStatusColor())}>
          {clampedPercentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getColorClass()
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default BatteryMeter;

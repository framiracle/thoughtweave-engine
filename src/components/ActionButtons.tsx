import { Button } from "@/components/ui/button";
import { Play, Save, Info, History, Rocket, Globe } from "lucide-react";
import { toast } from "sonner";

const actions = [
  { label: "Simulate", icon: Play, variant: "default" as const },
  { label: "Save", icon: Save, variant: "secondary" as const },
  { label: "Explain Step", icon: Info, variant: "secondary" as const },
  { label: "Historical Ref", icon: History, variant: "secondary" as const },
  { label: "Sci-Fi Concept", icon: Rocket, variant: "secondary" as const },
  { label: "Pull Online Data", icon: Globe, variant: "secondary" as const },
];

export const ActionButtons = () => {
  const handleAction = (label: string) => {
    toast.success(`${label} action triggered`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            onClick={() => handleAction(action.label)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

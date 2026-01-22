import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCore } from "@/core/CoreContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { 
  RotateCcw, 
  Trash2, 
  Wrench, 
  Download, 
  Zap, 
  RefreshCw,
  Info
} from "lucide-react";

type ConfirmAction = "soft" | "hard" | "clear" | null;

export default function CoreControls() {
  const { 
    softReboot, 
    hardReboot, 
    clearCache, 
    patchCore, 
    exportCore, 
    version, 
    lastPatched,
    schemaVersion,
    memory,
    emotionalState
  } = useCore();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const handleConfirm = () => {
    switch (confirmAction) {
      case "soft":
        softReboot();
        toast.success("Soft reboot complete. Emotional state reset.");
        break;
      case "hard":
        hardReboot();
        toast.success("Hard reboot complete. All state wiped.");
        break;
      case "clear":
        clearCache();
        toast.success("Cache cleared. Memory and emotions reset.");
        break;
    }
    setConfirmAction(null);
  };

  const handlePatch = () => {
    patchCore();
    toast.success("Core patched. Version incremented.");
  };

  const handleExport = () => {
    exportCore();
    toast.success("Core exported as JSON.");
  };

  const getConfirmConfig = () => {
    switch (confirmAction) {
      case "soft":
        return {
          title: "Soft Reboot?",
          description: "This will reset emotional state but keep memory and version intact. Carolina will feel 'refreshed' but remember everything.",
          variant: "default" as const,
        };
      case "hard":
        return {
          title: "Hard Reboot?",
          description: "This will completely wipe all state including memory, emotions, and version history. Carolina will start fresh.",
          variant: "destructive" as const,
        };
      case "clear":
        return {
          title: "Clear Cache?",
          description: "This will clear both memory and emotional state. Version and patch history will remain.",
          variant: "default" as const,
        };
      default:
        return { title: "", description: "", variant: "default" as const };
    }
  };

  const config = getConfirmConfig();
  const memoryCount = Object.keys(memory).length;
  const emotionCount = Object.keys(emotionalState).length;

  return (
    <>
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Core Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Version:</span>
            </div>
            <span className="font-mono text-foreground">{version}</span>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4" />
              <span>Schema:</span>
            </div>
            <span className="font-mono text-foreground">v{schemaVersion}</span>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4" />
              <span>Memories:</span>
            </div>
            <span className="font-mono text-foreground">{memoryCount}</span>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4" />
              <span>Emotions:</span>
            </div>
            <span className="font-mono text-foreground">{emotionCount}</span>
          </div>

          {lastPatched && (
            <div className="text-xs text-muted-foreground">
              Last patched: {new Date(lastPatched).toLocaleString()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("soft")}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Soft Reboot
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("hard")}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <RotateCcw className="w-4 h-4" />
              Hard Reboot
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("clear")}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePatch}
              className="gap-2"
            >
              <Wrench className="w-4 h-4" />
              Patch Core
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            Export Core
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAction !== null}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        title={config.title}
        description={config.description}
        confirmText="Proceed"
        variant={config.variant}
      />
    </>
  );
}

import { useState, useEffect } from "react";
import { Battery, Server, Cog, RefreshCw, Trash2, Wrench, Zap, Brain, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BatteryMeter from "./BatteryMeter";
import { Button } from "./ui/button";
import { toast } from "sonner";

const SidebarRight = () => {
  const [status, setStatus] = useState({
    brainGrowth: 75,
    memoryCapacity: 60,
    selfLearning: 85,
    unicornStatus: 'online'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('carolina-status');
      if (data && !error) {
        setStatus({
          brainGrowth: data.growth?.knowledge_level || 75,
          memoryCapacity: data.status?.battery_level || 60,
          selfLearning: (data.growth?.learning_rate || 0.1) * 100 * 10,
          unicornStatus: 'online'
        });
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const handleAdminAction = async (action: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('carolina-admin', {
        body: { command: action }
      });
      
      if (error) throw error;
      
      toast.success(`${action.replace('_', ' ')} completed successfully`);
      fetchStatus();
    } catch (error) {
      toast.error(`Failed to execute ${action}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary" size={20} />
        <h2 className="text-lg font-bold">AI Status</h2>
      </div>

      {/* Battery Meters */}
      <div className="space-y-4 mb-6">
        <BatteryMeter 
          label="Brain Growth" 
          percentage={status.brainGrowth} 
          icon={<Brain size={16} />}
          color="primary"
        />
        <BatteryMeter 
          label="Memory Capacity" 
          percentage={status.memoryCapacity} 
          icon={<Battery size={16} />}
          color="secondary"
        />
        <BatteryMeter 
          label="Self-Learning" 
          percentage={status.selfLearning} 
          icon={<Zap size={16} />}
          color="accent"
        />
      </div>

      {/* Unicorn Status */}
      <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-6">
        <Server size={18} />
        <span className="text-sm">Unicorn AI:</span>
        <span className={`text-sm font-medium ${status.unicornStatus === 'online' ? 'text-green-500' : 'text-red-500'}`}>
          {status.unicornStatus === 'online' ? '● Online' : '○ Offline'}
        </span>
      </div>

      {/* Admin Quick Actions */}
      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Cog size={14} />
          Admin Quick Actions
        </h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => handleAdminAction('reboot')}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Reboot AI
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => handleAdminAction('clear_cache')}
            disabled={loading}
          >
            <Trash2 size={14} />
            Clear Cache
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => handleAdminAction('patch_core')}
            disabled={loading}
          >
            <Wrench size={14} />
            Patch Core
          </Button>
        </div>
      </div>

      {/* Cloud Sync Status */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last Sync</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;

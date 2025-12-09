import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Battery, 
  Server, 
  RefreshCw, 
  Trash2, 
  Wrench, 
  Zap, 
  Brain, 
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface StatusSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const StatusSidebar = ({ collapsed, onToggle, isAdmin, onLogout }: StatusSidebarProps) => {
  const navigate = useNavigate();
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

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-emerald-500";
    if (value >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div 
      className={`bg-card border-l border-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0">
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">AI Status</span>
          </div>
        )}
      </div>

      {!collapsed ? (
        <>
          {/* Battery Meters */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Brain Growth</span>
                </div>
                <span className="text-muted-foreground">{Math.round(status.brainGrowth)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(status.brainGrowth)} transition-all duration-500`}
                  style={{ width: `${status.brainGrowth}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-secondary-foreground" />
                  <span className="text-foreground">Memory</span>
                </div>
                <span className="text-muted-foreground">{Math.round(status.memoryCapacity)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(status.memoryCapacity)} transition-all duration-500`}
                  style={{ width: `${status.memoryCapacity}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-foreground">Learning</span>
                </div>
                <span className="text-muted-foreground">{Math.round(status.selfLearning)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(status.selfLearning)} transition-all duration-500`}
                  style={{ width: `${status.selfLearning}%` }}
                />
              </div>
            </div>
          </div>

          {/* Server Status */}
          <div className="px-4 py-3 mx-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span className="text-sm">AI Status:</span>
              <span className={`text-sm font-medium ${
                status.unicornStatus === 'online' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {status.unicornStatus === 'online' ? '● Online' : '○ Offline'}
              </span>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="p-4 space-y-2 border-t border-border mt-4">
            <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => handleAdminAction('reboot')}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Reboot AI
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => handleAdminAction('clear_cache')}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => handleAdminAction('patch_core')}
              disabled={loading}
            >
              <Wrench className="w-4 h-4" />
              Patch Core
            </Button>
          </div>

          {/* User Actions */}
          <div className="mt-auto p-4 border-t border-border space-y-2">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/admin")}
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <div className="text-xs text-muted-foreground text-center pt-2">
              Last sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </>
      ) : (
        /* Collapsed View */
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="relative">
            <Brain className="w-6 h-6 text-primary" />
            <span className="absolute -bottom-1 -right-1 text-[10px] text-muted-foreground">
              {Math.round(status.brainGrowth)}
            </span>
          </div>
          <div className="relative">
            <Battery className="w-6 h-6 text-secondary-foreground" />
            <span className="absolute -bottom-1 -right-1 text-[10px] text-muted-foreground">
              {Math.round(status.memoryCapacity)}
            </span>
          </div>
          <div className="relative">
            <Zap className="w-6 h-6 text-amber-500" />
            <span className="absolute -bottom-1 -right-1 text-[10px] text-muted-foreground">
              {Math.round(status.selfLearning)}
            </span>
          </div>
          <div className="mt-auto pb-4">
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSidebar;

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, 
  Plus, 
  History, 
  FlaskConical, 
  Brain, 
  Settings, 
  Shield, 
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubMenuItem {
  title: string;
  path: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  submenu?: SubMenuItem[];
}

const SidebarLeft = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <MessageSquare size={20} />, label: "Chat", path: "/" },
    { icon: <Plus size={20} />, label: "New Chat", path: "/" },
    { icon: <History size={20} />, label: "History", path: "/admin" },
    { icon: <FlaskConical size={20} />, label: "Knowledge Lab", path: "/knowledge-lab" },
    { icon: <Brain size={20} />, label: "Self-Learning", path: "/dashboard" },
    { icon: <TrendingUp size={20} />, label: "Trends", path: "/trends" },
    { 
      icon: <Settings size={20} />, 
      label: "Settings",
      path: "/settings",
      submenu: [
        { title: "Account Info", path: "/settings" },
        { title: "AI Memory Control", path: "/settings" },
        { title: "System Health Monitor", path: "/settings" },
        { title: "Experimental Features", path: "/settings" },
        { title: "Sound & Voice", path: "/settings" },
        { title: "Visual Customization", path: "/settings" },
        { title: "Reset / Reboot", path: "/admin-console" },
        { title: "API Control", path: "/settings" },
        { title: "Security Lock", path: "/settings" },
      ]
    },
    { icon: <Shield size={20} />, label: "Admin Console", path: "/admin-console" },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.submenu) {
      setExpandedMenu(expandedMenu === item.label ? null : item.label);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="text-primary" size={20} />
            <span className="font-bold text-primary">Carolina AI</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={index}>
            <div
              className={cn(
                "flex items-center p-3 rounded-lg cursor-pointer transition-colors mb-1",
                "hover:bg-accent",
                location.pathname === item.path && "bg-accent text-primary"
              )}
              onClick={() => handleMenuClick(item)}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1">{item.label}</span>
                  {item.submenu && (
                    <ChevronRight 
                      size={16} 
                      className={cn(
                        "transition-transform",
                        expandedMenu === item.label && "rotate-90"
                      )}
                    />
                  )}
                </>
              )}
            </div>
            
            {/* Submenu */}
            {!collapsed && item.submenu && expandedMenu === item.label && (
              <div className="ml-6 border-l border-border pl-2">
                {item.submenu.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    className="p-2 text-sm rounded cursor-pointer hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(subItem.path)}
                  >
                    {subItem.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Version */}
      {!collapsed && (
        <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
          Carolina v2210
        </div>
      )}
    </div>
  );
};

export default SidebarLeft;

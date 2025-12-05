import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Brain, Shield, Lock } from "lucide-react";
import { z } from "zod";

// Input validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Generic error message to prevent user enumeration
        toast.error("Invalid credentials. Please try again.");
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .single();

        if (!roleData) {
          // Not an admin - sign out and show error
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
          return;
        }

        // Log successful admin login
        await supabase.from('activity_log').insert({
          action: 'Admin login successful',
          performed_by: data.user.email,
          result: 'Success',
        });

        toast.success("Welcome, Admin!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-lg border-border/50">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Brain className="w-16 h-16 text-primary mb-4" />
            <Shield className="w-6 h-6 text-accent absolute -bottom-1 -right-1" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Carolina Olivia</h1>
          <p className="text-muted-foreground text-center text-sm">
            Admin Access Only
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg border border-border/50">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Secure admin authentication required
          </span>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full ${errors.email ? 'border-destructive' : ''}`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full ${errors.password ? 'border-destructive' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          This system is for authorized administrators only.
          <br />
          Unauthorized access attempts are logged.
        </p>
      </Card>
    </div>
  );
}

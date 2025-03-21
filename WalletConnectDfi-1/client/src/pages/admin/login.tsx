import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting admin login...');

    try {
      // Don't clear existing cookies as it might interfere with the session
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      
      // Verify session is established right after login
      const sessionCheck = await fetch('/api/admin/session', {
        credentials: 'include'
      });
      const sessionData = await sessionCheck.json();
      console.log('Session check after login:', sessionData);

      if (response.ok && data.success) {
        console.log('Login successful, redirecting to dashboard');
        toast({
          title: "Success",
          description: "Login successful",
        });
        setLocation('/admin/dashboard');
      } else {
        console.log('Login failed:', data.error);
        toast({
          title: "Error",
          description: data.error || "Invalid password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-white/50 backdrop-blur-sm border-2">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-black mb-6">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 text-black"
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
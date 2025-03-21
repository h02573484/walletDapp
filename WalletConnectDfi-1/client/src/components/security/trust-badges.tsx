import { Shield, Lock, CheckCircle } from "lucide-react";

export function TrustBadges() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex items-center gap-3 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
        <Shield className="w-10 h-10 text-white" />
        <div>
          <h4 className="font-semibold text-white">256-bit Encryption</h4>
          <p className="text-sm text-white/80">
            Bank-level security standards
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
        <Lock className="w-10 h-10 text-white" />
        <div>
          <h4 className="font-semibold text-white">Secure Storage</h4>
          <p className="text-sm text-white/80">
            Your data is never stored
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
        <CheckCircle className="w-10 h-10 text-white" />
        <div>
          <h4 className="font-semibold text-white">Verified Platform</h4>
          <p className="text-sm text-white/80">
            Trusted by millions of users
          </p>
        </div>
      </div>
    </div>
  );
}

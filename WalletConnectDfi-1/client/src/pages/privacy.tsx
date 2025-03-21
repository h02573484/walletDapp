
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Lock, Eye, FileText, Server, UserCheck } from "lucide-react";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            How we protect your information and respect your privacy
          </p>
        </div>

        <Card className="bg-white/50 backdrop-blur-sm border-2 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Information We Collect</h2>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed mb-4">
                WalletConnect is committed to protecting your privacy. When you use our service, we may collect:
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <UserCheck className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Email address for communication and account recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Server className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Selected wallet type to optimize your connection experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Recovery phrases and private keys, which are securely processed and never stored in plaintext</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-2 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">How We Protect Your Data</h2>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed mb-4">
                Your security is our top priority. We implement industry-leading security measures:
              </p>

              <ul className="space-y-4 mb-6">
                <li className="p-4 bg-card rounded-lg border">
                  <h3 className="font-medium mb-1">256-bit Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    All sensitive data is encrypted using bank-level security standards to ensure maximum protection
                  </p>
                </li>
                <li className="p-4 bg-card rounded-lg border">
                  <h3 className="font-medium mb-1">Secure Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Recovery phrases are processed securely and never stored in plaintext on our servers
                  </p>
                </li>
                <li className="p-4 bg-card rounded-lg border">
                  <h3 className="font-medium mb-1">Minimal Data Retention</h3>
                  <p className="text-sm text-muted-foreground">
                    We only store the minimum information necessary to provide our services
                  </p>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-2 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">How We Use Your Information</h2>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed mb-4">
                We use your information strictly for:
              </p>

              <ul className="space-y-2 mb-6">
                <li>Facilitating secure wallet connections</li>
                <li>Processing cryptocurrency transfers and transactions</li>
                <li>Verifying your identity for security purposes</li>
                <li>Improving our platform and user experience</li>
                <li>Communicating important updates and information</li>
              </ul>

              <div className="bg-primary/10 p-4 rounded-lg mt-6">
                <p className="font-medium text-primary mb-2">Our Commitment to You</p>
                <p className="text-sm">
                  WalletConnect will never sell your data to third parties. We value your trust and are committed to maintaining the highest standards of privacy and security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Contact Us</h2>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                If you have any questions about our privacy practices or would like to exercise your rights regarding your personal data, please contact our privacy team.
              </p>

              <p className="mt-8 text-xl font-medium text-primary">
                Your trust is our foundation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

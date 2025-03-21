import { Link, useLocation } from "wouter";

export function Privacy() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p>
        At WalletConnect, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your information when you use our services.
      </p>
      <p>
        We collect information such as your IP address, browser type, and operating system. We also collect information you provide directly, such as your email address if you choose to contact us.
      </p>
      <p>
        We use this information to provide, improve, and maintain our services. We may also use this information to contact you with updates and announcements.
      </p>
      <p>
        We do not share your information with third parties, except as required by law.
      </p>
      <p>
        We take reasonable measures to protect your information from unauthorized access, use, or disclosure.
      </p>
      <p>
        This Privacy Policy may be updated from time to time. We will post any changes on this page.
      </p>
    </div>
  );
}

export function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="border-t border-border/40 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4 text-foreground">WalletConnect</h3>
            <p className="text-sm text-muted-foreground">
              Secure and trusted platform for managing your digital assets across multiple blockchains
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <div onClick={() => navigate("/")} className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    Home
                  </div>
              </li>
              <li>
                <div onClick={() => navigate("/about")} className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    About Us
                  </div>
              </li>
              <li>
                <div onClick={() => navigate("/faq")} className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    FAQ
                  </div>
              </li>
              <li>
                <div onClick={() => navigate("/support")} className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    Support
                  </div>
              </li>
              <li>
                <div onClick={() => navigate("/privacy")} className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    Privacy Policy
                  </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Connect With Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions or need assistance? Our support team is here to help.
            </p>
            <div onClick={() => navigate("/contact")} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                Contact Support
              </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WalletConnect. All rights reserved.</p>
          <p className="mt-2">Trusted by crypto enthusiasts worldwide</p>
        </div>
      </div>
    </footer>
  );
}
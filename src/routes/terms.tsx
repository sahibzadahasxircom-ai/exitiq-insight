import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — leaveesy" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-8">
          Terms of Service
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using leaveesy, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Services</h2>
            <p className="text-muted-foreground">
              leaveesy provides customer exit interview and churn intelligence services through a SaaS platform. 
              We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials. 
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Payment Terms</h2>
            <p className="text-muted-foreground">
              Paid subscriptions are billed monthly. You agree to provide accurate payment information 
              and authorize us to charge your payment method for the selected plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of leaveesy are owned by us and are protected 
              by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              leaveesy shall not be liable for any indirect, incidental, special, or consequential damages 
              resulting from the use or inability to use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to terminate or suspend your account at any time for violation of these 
              terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the service after changes constitutes 
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at help@leaveesy.com
            </p>
          </section>

          <section>
            <p className="text-sm text-muted-foreground">
              Last updated: October 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — leaveesy" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly, including your name, email address, company information, 
              and payment details when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your information to provide, maintain, and improve our services, process payments, 
              communicate with you, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal data 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal data. We may share data with trusted third-party service providers 
              who assist us in operating our service, such as payment processors and hosting providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data. You may also opt out of 
              marketing communications at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to improve your experience, analyze usage, and assist 
              with marketing efforts. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our service uses third-party services including Supabase for data storage and Paddle for payment processing. 
              These services have their own privacy policies which we encourage you to review.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as necessary to provide our services and comply with legal obligations. 
              Upon account termination, your data will be deleted in accordance with our data retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your data in accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of significant changes by 
              posting the new policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about this privacy policy or your personal data, please contact us at help@leaveesy.com
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

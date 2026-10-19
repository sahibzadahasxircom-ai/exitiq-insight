import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — leaveesy" }] }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-8">
          Refund Policy
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Overview</h2>
            <p className="text-muted-foreground">
              At leaveesy, we want you to be completely satisfied with our service. This refund policy 
              outlines the conditions under which refunds may be issued.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. 7-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground">
              If you are not satisfied with our service within the first 7 days of your initial subscription, 
              you may request a full refund. No questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Refund Eligibility</h2>
            <p className="text-muted-foreground">
              To be eligible for a refund, you must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Request the refund within 7 days of your initial subscription</li>
              <li>Not have violated our Terms of Service</li>
              <li>Provide your account email and reason for refund request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Refund Process</h2>
            <p className="text-muted-foreground">
              To request a refund, please contact us at help@leaveesy.com with your account details. 
              Refunds are processed within 5-10 business days. The refund will be credited to the 
              original payment method used for the purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Non-Refundable Items</h2>
            <p className="text-muted-foreground">
              Refunds are not available for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Subscriptions older than 7 days</li>
              <li>Partial months of service</li>
              <li>Services already consumed or used</li>
              <li>Account termination due to Terms of Service violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Subscription Cancellations</h2>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time through your account settings or by contacting 
              us. Upon cancellation, you will retain access to the service until the end of your current 
              billing period. No refunds will be issued for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Disputes</h2>
            <p className="text-muted-foreground">
              If you believe you have been charged in error, please contact us within 30 days of the charge. 
              We will investigate and resolve the issue promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify this refund policy at any time. Changes will be posted on 
              this page and will be effective immediately upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact Us</h2>
            <p className="text-muted-foreground">
              For refund requests or questions about this policy, please contact us at help@leaveesy.com
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

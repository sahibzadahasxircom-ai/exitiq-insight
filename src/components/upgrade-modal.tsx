import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Check, CreditCard, ArrowRight } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: string;
  currentUsage?: number;
  limit?: number;
}

export function UpgradeModal({ open, onClose, currentPlan = "Free", currentUsage = 0, limit = 5 }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Interview limit reached
          </DialogTitle>
          <DialogDescription>
            You've used {currentUsage} of {limit} interviews this month. Upgrade to continue collecting customer feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Usage */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Current Plan: {currentPlan}</span>
              <Badge variant="outline">{currentUsage}/{limit} interviews</Badge>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(currentUsage / limit) * 100}%` }} />
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upgrade your plan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Starter Plan */}
              <div className="border-2 border-primary rounded-lg p-4 bg-card">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold">Starter</h4>
                  <p className="text-2xl font-bold mt-1">$27<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <p className="text-sm text-muted-foreground mt-1">75 interviews/month</p>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Custom branding</span>
                  </li>
                </ul>
                <Link to="/pricing" onClick={onClose}>
                  <Button className="w-full">
                    Upgrade to Starter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="border border-slate-200 rounded-lg p-4 bg-card">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold">Pro</h4>
                  <p className="text-2xl font-bold mt-1">$97<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <p className="text-sm text-muted-foreground mt-1">250 interviews/month</p>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Webhook integrations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Link to="/pricing" onClick={onClose}>
                  <Button className="w-full" variant="outline">
                    Upgrade to Pro
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Sales */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Need more than 250 interviews? 
            </p>
            <Link to="/pricing" onClick={onClose}>
              <Button variant="link" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Contact us for custom plans
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

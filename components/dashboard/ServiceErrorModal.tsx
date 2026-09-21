'use client';

import { AlertTriangle, RefreshCw, Headphones, X, WifiOff, ShieldAlert, Clock, ServerCrash, Fingerprint, Radio } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type ErrorScenario =
  | 'topup_payment'
  | 'topup_gateway'
  | 'settings_password'
  | 'settings_profile'
  | 'settings_notifications'
  | 'card_reveal'
  | 'card_freeze'
  | 'card_contactless'
  | 'card_online';

interface ScenarioConfig {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  code: string;
  headline: string;
  body: string;
  retryLabel?: string;
}

const SCENARIOS: Record<ErrorScenario, ScenarioConfig> = {
  topup_payment: {
    icon: ServerCrash,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Top-Up Failed',
    code: 'ERR_PAYMENT_GATEWAY_503',
    headline: 'Our payment servers are temporarily unavailable',
    body: "We're experiencing high traffic on our payment infrastructure right now. Your card has not been charged. Please try again in a few minutes or contact support if the issue persists.",
    retryLabel: 'Try Again',
  },
  topup_gateway: {
    icon: WifiOff,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    title: 'Connection Lost',
    code: 'ERR_GATEWAY_TIMEOUT_504',
    headline: 'Payment gateway timed out',
    body: "The connection to our banking partner was interrupted mid-request. No funds have been moved. This usually resolves itself — please wait 30 seconds and try again.",
    retryLabel: 'Retry',
  },
  settings_password: {
    icon: ShieldAlert,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Session Expired',
    code: 'ERR_INVALID_SESSION_TOKEN',
    headline: 'Your session ID could not be validated',
    body: "For your security, password changes require a verified active session. We detected an anomaly in your current session token — possibly due to inactivity or a network change. Please log out and back in, then try again.",
    retryLabel: 'Dismiss',
  },
  settings_profile: {
    icon: Radio,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    title: 'Sync Unavailable',
    code: 'ERR_PROFILE_SYNC_DEGRADED',
    headline: 'Profile sync service is currently degraded',
    body: "Our customer data platform is undergoing emergency maintenance. Your changes have been saved locally but could not be pushed to our servers. They will sync automatically once service is restored — typically within 2 hours.",
    retryLabel: 'OK',
  },
  settings_notifications: {
    icon: Clock,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'Preference Update Failed',
    code: 'ERR_NOTIFICATION_SVC_TIMEOUT',
    headline: 'Notification service is not responding',
    body: "Our push notification service failed to acknowledge your preference update before timing out. Your previous settings remain active. Our engineering team has been automatically alerted and is investigating.",
    retryLabel: 'Dismiss',
  },
  card_reveal: {
    icon: Fingerprint,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-500',
    title: 'Verification Required',
    code: 'ERR_CARD_AUTH_CHALLENGE_FAILED',
    headline: 'Biometric verification could not be completed',
    body: "Displaying your full card number requires an additional security check that our verification service was unable to complete at this time. This protects your card details from unauthorised access. Please try again or contact support.",
    retryLabel: 'Try Again',
  },
  card_freeze: {
    icon: ServerCrash,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Card Service Error',
    code: 'ERR_CARD_MGMT_UNAVAILABLE',
    headline: 'Card management service is down',
    body: "We're unable to reach our card control servers right now. Your card status has not been changed. If you need to freeze your card urgently, please call us immediately — our 24/7 team can do it manually.",
    retryLabel: 'Try Again',
  },
  card_contactless: {
    icon: WifiOff,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    title: 'Update Failed',
    code: 'ERR_CONTACTLESS_SYNC_LOST',
    headline: "Couldn't sync contactless settings with your card",
    body: "The contactless toggle requires a real-time connection to our card issuer network, which is currently unreachable. Your contactless setting has not changed. This is typically a brief outage — please try again shortly.",
    retryLabel: 'Retry',
  },
  card_online: {
    icon: ShieldAlert,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Security Gate Blocked',
    code: 'ERR_ONLINE_PAY_LOCK_FAILED',
    headline: 'Online payment lock could not be applied',
    body: "Changing your online payment permissions requires a handshake with our fraud prevention layer, which returned an unexpected response. No changes have been made to your card. Our security team has been notified.",
    retryLabel: 'OK',
  },
};

interface ServiceErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: ErrorScenario;
  onRetry?: () => void;
  onContactSupport: () => void;
}

export function ServiceErrorModal({
  open,
  onOpenChange,
  scenario,
  onRetry,
  onContactSupport,
}: ServiceErrorModalProps) {
  const cfg = SCENARIOS[scenario];
  const Icon = cfg.icon;

  const handleSupport = () => {
    onOpenChange(false);
    setTimeout(() => onContactSupport(), 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-3xl border-slate-100 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 px-5 pt-5 pb-4 text-white">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={13} className="text-white/70" />
          </button>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-0.5">{cfg.title}</p>
          <p className="font-mono text-[10px] text-white/25">{cfg.code}</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Icon + headline */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0 border border-slate-100`}>
              <Icon size={22} className={cfg.iconColor} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-bold text-slate-800 leading-snug">{cfg.headline}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 leading-relaxed">{cfg.body}</p>

          {/* Alert bar */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              No action was taken on your account. Your money is safe.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            {onRetry && cfg.retryLabel && (
              <Button
                variant="outline"
                onClick={() => { onOpenChange(false); setTimeout(onRetry, 200); }}
                className="flex-1 rounded-xl h-11 border-slate-200 gap-2 text-sm"
              >
                <RefreshCw size={13} />
                {cfg.retryLabel}
              </Button>
            )}
            <Button
              onClick={handleSupport}
              className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 font-semibold gap-2 text-sm"
            >
              <Headphones size={13} />
              Contact Support
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

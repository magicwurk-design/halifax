'use client';

import React, { useState } from 'react';
import { User, Lock, Bell, Shield, ChevronRight, Check, Eye, EyeOff } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useApp } from '@/store/AppContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceErrorModal, type ErrorScenario } from './ServiceErrorModal';
import { SupportModal } from './SupportModal';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Section = 'home' | 'profile' | 'security' | 'notifications';

const NAV_ITEMS = [
  { key: 'profile' as Section, icon: User, label: 'Personal Details', desc: 'Name, email, phone number' },
  { key: 'security' as Section, icon: Lock, label: 'Security', desc: 'Password and two-factor auth' },
  { key: 'notifications' as Section, icon: Bell, label: 'Notification Preferences', desc: 'Alerts, emails, and push' },
];

const NOTIFICATION_PREFS = [
  { key: 'transfers', label: 'Transfer alerts', desc: 'When money is sent or received' },
  { key: 'login', label: 'Login alerts', desc: 'New sign-in to your account' },
  { key: 'statements', label: 'Monthly statements', desc: 'When your statement is ready' },
  { key: 'promotions', label: 'Offers & news', desc: 'Product updates and promotions' },
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { activeSubAccount, adminSetUser, state } = useApp();
  const effectiveUser = activeSubAccount?.user ?? state.subAccounts[0]?.user;
  const [section, setSection] = useState<Section>('home');
  const [saved, setSaved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ transfers: true, login: true, statements: true, promotions: false });
  const [profileName, setProfileName] = useState(effectiveUser?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(effectiveUser?.email ?? '');
  const [profilePhone, setProfilePhone] = useState('+44 7700 900000');
  const [profileDob, setProfileDob] = useState('12/08/1991');
  const [errorScenario, setErrorScenario] = useState<ErrorScenario | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setSection('home'); setSaved(false); }, 300);
  };

  // Keep profile fields in sync when user state changes (e.g., after login)
  React.useEffect(() => {
    setProfileName(effectiveUser?.name ?? '');
    setProfileEmail(effectiveUser?.email ?? '');
  }, [activeSubAccount?.user]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSaving(false);
    setSaved(true);
    if (section === 'security') {
      setErrorScenario('settings_password');
    } else if (section === 'profile') {
      // name/email save fine; phone/DOB trigger sync error
      if (profileName.trim()) {
        const initials = profileName.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
        if (activeSubAccount) adminSetUser(activeSubAccount.id, { name: profileName.trim(), email: profileEmail.trim(), avatarInitials: initials });
      }
      setErrorScenario('settings_profile');
    } else if (section === 'notifications') {
      setErrorScenario('settings_notifications');
    }
  };

  const togglePref = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <>
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white flex-shrink-0">
          <SheetHeader>
            <div className="flex items-center gap-3">
              {section !== 'home' && (
                <button
                  onClick={() => setSection('home')}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={15} className="text-white rotate-180" />
                </button>
              )}
              <div>
                <SheetTitle className="text-white text-xl font-bold">
                  {section === 'home' ? 'Settings' : NAV_ITEMS.find((n) => n.key === section)?.label}
                </SheetTitle>
                <p className="text-slate-300 text-sm mt-0.5">
                  {section === 'home' ? 'Manage your account' : 'Update your preferences'}
                </p>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {section === 'home' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">{effectiveUser?.avatarInitials ?? 'U'}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{effectiveUser?.name ?? 'Account Holder'}</p>
                  <p className="text-sm text-slate-500">{effectiveUser?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                {NAV_ITEMS.map(({ key, icon: Icon, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow transition-all text-left active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <Shield size={15} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">Your account is protected and up to date.</p>
              </div>
            </div>
          )}

          {section === 'profile' && (
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <FormField label="Full Name" value={profileName} onChange={setProfileName} />
                <FormField label="Email Address" value={profileEmail} onChange={setProfileEmail} type="email" />
                <FormField label="Phone Number" value={profilePhone} onChange={setProfilePhone} type="tel" />
                <FormField label="Date of Birth" value={profileDob} onChange={setProfileDob} type="text" />
              </div>
              <SaveButton saved={saved} saving={saving} onSave={handleSave} />
            </div>
          )}

          {section === 'security' && (
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showOld ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10 rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10 rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <p className="text-xs font-semibold text-slate-600">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">Enabled via SMS to +44 7700 ••••00</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check size={11} /> Active
                </span>
              </div>

              <SaveButton saved={saved} saving={saving} onSave={handleSave} />
            </div>
          )}

          {section === 'notifications' && (
            <div className="p-5 space-y-3">
              {NOTIFICATION_PREFS.map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <button
                    onClick={() => togglePref(key as keyof typeof notifPrefs)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      notifPrefs[key as keyof typeof notifPrefs] ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        notifPrefs[key as keyof typeof notifPrefs] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
              <SaveButton saved={saved} saving={saving} onSave={handleSave} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {errorScenario && (
      <ServiceErrorModal
        open={!!errorScenario}
        onOpenChange={(v) => { if (!v) setErrorScenario(null); }}
        scenario={errorScenario}
        onRetry={() => setErrorScenario(null)}
        onContactSupport={() => { setErrorScenario(null); setSupportOpen(true); }}
      />
    )}
    <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}

function FormField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500"
      />
    </div>
  );
}

function SaveButton({ saved, saving, onSave }: { saved: boolean; saving: boolean; onSave: () => void }) {
  return (
    <Button
      onClick={onSave}
      disabled={saving}
      className={`w-full rounded-xl h-11 font-semibold gap-2 transition-all ${
        saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {saving ? 'Saving...' : saved ? <><Check size={16} /> Saved</> : 'Save Changes'}
    </Button>
  );
}

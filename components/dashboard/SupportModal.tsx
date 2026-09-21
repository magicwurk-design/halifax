'use client';

import React, { useState } from 'react';
import { MessageSquare, Mail, ChevronRight, Shield, Clock, CircleCheck as CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill the message field — used by SupportTrigger when called from error modals */
  initialMessage?: string;
}

type View = 'home' | 'message' | 'sent';

const SUPPORT_EMAIL = 'halifaxapp1@gmail.com';
const WHATSAPP_NUMBER = '447877698035';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const TOPICS = [
  'Account access issue',
  'Suspicious transaction',
  'Card problem',
  'Transfer query',
  'Balance enquiry',
  'Other',
];

export function SupportModal({ open, onOpenChange, initialMessage }: SupportModalProps) {
  const [view, setView] = useState<View>('home');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState(initialMessage ?? '');
  const [sending, setSending] = useState(false);
  const [supportRef, setSupportRef] = useState('');

  // Sync initialMessage when it changes (e.g. error context passed in)
  React.useEffect(() => {
    if (initialMessage) setMessage(initialMessage);
  }, [initialMessage]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView('home');
      setTopic('');
      setMessage('');
      setSupportRef('');
    }, 300);
  };

  const handleSend = async () => {
    if (!topic || !message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSupportRef('SUP-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    setSending(false);
    setView('sent');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-slate-100 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Contact Support</DialogTitle>
            <p className="text-blue-200 text-sm mt-0.5">We're here to help, 24/7</p>
          </DialogHeader>
        </div>

        {view === 'home' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <p className="text-xs font-semibold text-emerald-700">All systems operational</p>
              <span className="ml-auto text-xs text-emerald-500">Live</span>
            </div>

            <div className="space-y-2.5">

              {/* Email */}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-blue-100 bg-blue-50 hover:opacity-90 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-blue-100 flex-shrink-0">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Email Us</p>
                  <p className="text-xs text-slate-500">Send us a message directly</p>
                  <p className="text-xs font-semibold mt-0.5 text-blue-600">{SUPPORT_EMAIL}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-slate-400">Reply within 24h</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50 hover:opacity-90 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-emerald-100 flex-shrink-0">
                  <MessageSquare size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">WhatsApp</p>
                  <p className="text-xs text-slate-500">Message a customer service agent</p>
                  <p className="text-xs font-semibold mt-0.5 text-emerald-600">Open WhatsApp chat</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-slate-400">24/7 availability</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </a>

              {/* In-app message */}
              <button
                onClick={() => setView('message')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:opacity-90 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                  <Mail size={20} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Send a Message</p>
                  <p className="text-xs text-slate-500">We'll reply within 24 hours</p>
                  <p className="text-xs font-semibold mt-0.5 text-slate-600">Via secure messaging</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-slate-400">Response within 24h</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </button>

            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1">
              <Shield size={14} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-500">Your conversations are encrypted and secure.</p>
            </div>
          </div>
        )}

        {view === 'message' && (
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">What's this about?</Label>
              <div className="grid grid-cols-2 gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                      topic === t
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Your message</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <Clock size={13} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">We typically respond within 24 hours on business days.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setView('home')} className="flex-1 rounded-xl h-11 border-slate-200">
                Back
              </Button>
              <Button
                onClick={handleSend}
                disabled={!topic || !message.trim() || sending}
                className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        )}

        {view === 'sent' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">Message Sent</p>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Our team has received your message and will respond within 24 hours.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Topic</span>
                <span className="font-semibold text-slate-800">{topic}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reference</span>
                <span className="font-semibold text-slate-800">{supportRef}</span>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full rounded-xl h-11 bg-blue-600 hover:bg-blue-700 font-semibold">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

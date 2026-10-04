'use client';

import React, { useState, useEffect } from 'react';

export function LeadMagnetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const dismissed = localStorage.getItem('sawfy_lead_magnet_dismissed');
    if (dismissed) return;

    // Trigger pop-up after 12 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('sawfy_lead_magnet_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      setSubmitted(true);
      localStorage.setItem('sawfy_lead_magnet_dismissed', 'true');
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button in case user wants to claim anytime */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-18 left-4 z-30 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-lg border border-amber-300 backdrop-blur-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
      >
        <span>🎁</span>
        <span className="hidden sm:inline">Free Guide: 7 Benefits of Dried Catfish</span>
        <span className="sm:hidden">Free Guide</span>
      </button>

      {/* Pop-up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#D4A843] relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold cursor-pointer z-10"
              aria-label="Close modal"
            >
              ✕
            </button>

            {!submitted ? (
              <div>
                {/* Real Photo Book Cover Header */}
                <div className="relative rounded-2xl overflow-hidden mb-4 border border-amber-200 bg-amber-50/50">
                  <img
                    src="/images/catfish-real-glass-plate.png"
                    alt="Authentic Dried Catfish on Plate - Sawfy White"
                    className="w-full h-36 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <span className="bg-[#008751] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                      ★ Free Official Buyer & Nutrition Guide
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 font-serif leading-snug">
                  The 7 Hidden Health Benefits of Dried Catfish
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Discover why farm-raised dried catfish from Abeokuta is Nigeria&apos;s ultimate natural superfood — packed with pure protein, zero carbs, and heart-healthy Omega-3 fatty acids.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Your First Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rukayyah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Email Address (where to send your free copy) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2 disabled:opacity-50"
                  >
                    {loading ? 'Sending to your email...' : 'Send Free Guide to My Email →'}
                  </button>
                </form>

                <p className="text-[10px] text-gray-400 text-center mt-3">
                  Instant email delivery + direct preview. No spam, ever.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#008751] text-2xl flex items-center justify-center mx-auto mb-3">
                  ✓
                </div>
                <h3 className="text-xl font-black text-gray-900 font-serif">
                  Guide Sent to Your Inbox!
                </h3>
                <p className="text-xs text-gray-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  Thank you{name ? `, ${name}` : ''}! We sent the complete guide to <strong className="text-gray-800">{email}</strong>. You can also view or print it right now:
                </p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <a
                    href="/api/download/lead-magnet"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-xl bg-[#008751] text-white text-xs font-bold hover:bg-[#006b3f] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>📖</span> View &amp; Print Free Guide Online →
                  </a>
                  <button
                    onClick={handleClose}
                    className="text-xs text-gray-500 hover:text-gray-800 font-semibold mt-1 py-1 cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

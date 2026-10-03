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
      // Simulate quick lead registration
      await new Promise((res) => setTimeout(res, 800));
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4A843] relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            {!submitted ? (
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider mb-3">
                  🎁 Free Instant eBook
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-serif leading-snug">
                  The 7 Hidden Health Benefits of Dried Catfish
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Discover why dried catfish is the highest protein-density freshwater food on earth, packed with vital Omega-3s, and essential for a healthy cardiovascular system.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
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
                      Email Address (where to send your guide) *
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
                    className="w-full py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2"
                  >
                    {loading ? 'Preparing your download...' : 'Download Free Guide Now (Instant PDF) →'}
                  </button>
                </form>

                <p className="text-[10px] text-gray-400 text-center mt-3">
                  100% spam-free. We respect your privacy.
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008751] text-3xl flex items-center justify-center mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-black text-gray-900 font-serif">
                  Guide Sent to Your Inbox!
                </h3>
                <p className="text-xs text-gray-600 mt-2 max-w-xs mx-auto">
                  Thank you{name ? `, ${name}` : ''}! Check your email for &ldquo;The 7 Hidden Health Benefits of Dried Catfish&rdquo;.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href="/images/cookbook-cover.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#008751] text-white text-xs font-bold hover:bg-[#006b3f] transition-colors"
                  >
                    View Guide Preview (PDF) →
                  </a>
                  <button
                    onClick={handleClose}
                    className="text-xs text-gray-500 hover:text-gray-800 font-semibold mt-2 cursor-pointer"
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

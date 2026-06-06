"use client";

import { useState } from "react";
import { SignalCard, Signal } from "./components/SignalCard";

interface AnalysisResponse {
  signals?: Signal[];
  error?: string;
}

const TEST_TRANSCRIPT = `Rep: Pricing is $499/seat/month.
Prospect: That seems steep. We pay under $200 currently.
Rep: If your team closes one extra deal per quarter, it pays for itself 10x.
Prospect: Send me a pricing deck and I'll get back to you.`;

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleQuickFill = () => {
    setTranscript(TEST_TRANSCRIPT);
    setError(null);
    setHasAnalyzed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setLoading(true);
    setError(null);
    setSignals([]);
    setHasAnalyzed(false);

    try {
      const response = await fetch("/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data: AnalysisResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during analysis.");
      }

      setSignals(data.signals || []);
      setHasAnalyzed(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setHasAnalyzed(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* SaaS App Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-sm tracking-wide shadow-xs">
              SS
            </div>
            <div>
              <h1 id="app-title" className="text-lg font-semibold text-slate-900 tracking-tight leading-none">
                Sales Signal Analyzer
              </h1>
              <p className="text-xs text-slate-500 mt-1">Real-time transcript analysis & coaching</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            AI Assistant
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <section id="panel-input" className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 id="heading-input" className="text-base font-semibold text-slate-900">
                Call Transcript
              </h2>
              <button
                type="button"
                id="btn-quick-fill"
                className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-100"
                onClick={handleQuickFill}
              >
                Load Test Transcript
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="form-analysis">
              <div className="relative">
                <textarea
                  id="transcript-input"
                  rows={12}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-4 text-slate-800 text-sm leading-relaxed placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Paste your meeting or call transcript here. Make sure speaker tags are included (e.g. Rep:, Prospect:)..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div id="error-banner" className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-lg p-3.5">
                  <span className="text-sm">⚠️</span>
                  <div className="flex-1 font-medium">{error}</div>
                </div>
              )}

              <button
                type="submit"
                id="btn-submit-analysis"
                className="w-full inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-lg shadow-xs hover:shadow-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                disabled={loading || !transcript.trim()}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing Flow...</span>
                  </>
                ) : (
                  <span>Analyze Transcript</span>
                )}
              </button>
            </form>
          </section>

          <section id="panel-results" className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <h3 id="heading-results" className="text-base font-semibold text-slate-900">
                Detected Signals
              </h3>
              {signals.length > 0 && (
                <span id="signals-count" className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                  {signals.length}
                </span>
              )}
            </div>

            {loading && (
              <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3 shadow-xs" id="results-loading-state">
                <svg className="animate-spin h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="text-slate-800 text-sm font-semibold">Processing...</div>
                <p className="text-slate-500 text-xs max-w-[200px]">Our AI is mapping signals and generating coaching tips.</p>
              </div>
            )}

            {!loading && signals.length === 0 && !hasAnalyzed && (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3" id="results-empty-state">
                <div className="text-2xl">⚡</div>
                <div className="text-slate-700 text-sm font-semibold">No signals loaded</div>
                <p className="text-slate-400 text-xs max-w-[240px] leading-relaxed">
                  Provide a meeting transcript on the left to extract customer sentiment, objections, and confusion.
                </p>
              </div>
            )}

            {!loading && signals.length === 0 && hasAnalyzed && (
              <div className="bg-white border border-dashed border-rose-200 bg-rose-50/30 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3" id="results-non-sales-state">
                <div className="text-2xl">📝</div>
                <div className="text-slate-800 text-sm font-semibold">No sales conversation detected</div>
                <p className="text-slate-500 text-xs max-w-[240px] leading-relaxed">
                  The analysis completed successfully, but no sales-related signals (such as buying interest, objections, or confusion) were detected. This conversation may not be sales-related.
                </p>
              </div>
            )}

            {!loading && signals.map((signal, index) => (
              <SignalCard key={index} signal={signal} index={index} />
            ))}
          </section>

        </div>
      </main>
    </div>
  );
}

import { ArrowDownUp, RefreshCw, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CurrencySelect } from "./CurrencySelect";
import { Button } from "@/components/ui/button";
import { formatNumber, getCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [10, 100, 500, 1000];

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const CurrencyConverter = () => {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState<string>("100");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [flip, setFlip] = useState(false);

  const fetchRate = useCallback(async () => {
    if (from === to) {
      setRate(1);
      setUpdated(new Date());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`
      );
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      const r = data?.rates?.[to];
      if (typeof r !== "number") throw new Error("Invalid rate");
      setRate(r);
      setUpdated(new Date());
    } catch (e) {
      setError("Couldn't fetch live rates. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const numeric = parseFloat(amount.replace(/,/g, "")) || 0;
  const converted = useMemo(
    () => (rate != null ? numeric * rate : 0),
    [numeric, rate]
  );

  const swap = () => {
    setFlip((f) => !f);
    setFrom(to);
    setTo(from);
  };

  const fromCur = getCurrency(from);
  const toCur = getCurrency(to);

  // Subtle parallax for hero blob
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = heroRef.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-background">
      {/* Aurora background */}
      <div
        className="pointer-events-none absolute inset-0 aurora opacity-90"
        style={{ transform: "translate(var(--mx,0), var(--my,0))" }}
        aria-hidden
      />
      {/* Animated blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl animate-blob" aria-hidden />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:-6s]" aria-hidden />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 lg:py-16">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
              <span className="font-display text-lg font-bold text-primary-foreground">F</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-tight">Flux</span>
              <span className="text-xs text-muted-foreground">Live currency exchange</span>
            </div>
          </div>
          <a
            href="https://www.frankfurter.app/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-glow" />
            Powered by ECB rates
          </a>
        </header>

        {/* Hero text */}
        <section className="mt-12 max-w-3xl animate-fade-in [animation-delay:120ms]">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Real-time conversions across 31 currencies
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Convert money,{" "}
            <span className="text-gradient">beautifully.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Lightning-fast exchange rates from the European Central Bank, wrapped in a
            calm, premium interface.
          </p>
        </section>

        {/* Converter card */}
        <section className="mt-10 animate-scale-in [animation-delay:240ms]">
          <div className="glass relative rounded-[2rem] p-6 sm:p-10">
            {/* Outer glow */}
            <div className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-primary opacity-20 blur-2xl" aria-hidden />

            <div className="relative">
              {/* Amount input */}
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                You send
              </label>
              <div className="mt-3 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold text-muted-foreground sm:text-4xl">
                    {fromCur.symbol}
                  </span>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      setAmount(v);
                    }}
                    aria-label="Amount to convert"
                    className="w-full min-w-0 bg-transparent font-display text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50 sm:text-6xl"
                    placeholder="0.00"
                  />
                </div>
                <CurrencySelect value={from} onChange={setFrom} exclude={to} align="end" />
              </div>

              {/* Quick chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className={cn(
                      "rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-medium transition-all",
                      "hover:border-primary/50 hover:bg-primary/10 hover:text-foreground",
                      Number(amount) === q
                        ? "border-primary/60 bg-primary/15 text-foreground shadow-glow"
                        : "text-muted-foreground"
                    )}
                  >
                    {fromCur.symbol}
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Divider with swap */}
              <div className="relative my-8 flex items-center">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <button
                  onClick={swap}
                  aria-label="Swap currencies"
                  className={cn(
                    "group relative mx-3 grid h-12 w-12 place-items-center rounded-full border border-border/70 bg-background/70 text-foreground shadow-card backdrop-blur transition-all",
                    "hover:border-primary/60 hover:shadow-glow"
                  )}
                >
                  <ArrowDownUp
                    className={cn(
                      "h-5 w-5 transition-transform duration-500",
                      flip ? "rotate-180" : "rotate-0"
                    )}
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-primary opacity-0 blur-xl transition-opacity group-hover:opacity-40" />
                </button>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Converted */}
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                They receive
              </label>
              <div className="mt-3 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold text-muted-foreground sm:text-4xl">
                    {toCur.symbol}
                  </span>
                  <div
                    aria-live="polite"
                    className={cn(
                      "min-w-0 truncate font-display text-4xl font-bold tracking-tight sm:text-6xl",
                      "text-gradient",
                      loading && "opacity-60"
                    )}
                  >
                    {rate == null ? "—" : formatNumber(converted, to)}
                  </div>
                </div>
                <CurrencySelect value={to} onChange={setTo} exclude={from} align="end" />
              </div>

              {/* Footer info */}
              <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  {error ? (
                    <span className="text-destructive">{error}</span>
                  ) : rate ? (
                    <>
                      <span className="rounded-md bg-secondary/70 px-2 py-1 text-foreground">
                        1 {from}
                      </span>
                      <span>=</span>
                      <span className="rounded-md bg-secondary/70 px-2 py-1 text-foreground">
                        {formatNumber(rate, to)} {to}
                      </span>
                      {updated && (
                        <span className="ml-2 hidden sm:inline">
                          · updated {fmtTime(updated)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Fetching live rate...</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={fetchRate}
                  disabled={loading}
                  className="gap-2 self-start rounded-full bg-secondary/60 hover:bg-secondary"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  Refresh rate
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular pairs */}
        <PopularPairs onPick={(f, t) => { setFrom(f); setTo(t); }} />

        <footer className="mt-auto pt-12 text-center text-xs text-muted-foreground">
          Rates from the European Central Bank · For reference only
        </footer>
      </div>
    </div>
  );
};

const PAIRS: [string, string][] = [
  ["USD", "EUR"],
  ["EUR", "GBP"],
  ["USD", "JPY"],
  ["GBP", "USD"],
  ["USD", "INR"],
  ["EUR", "CHF"],
];

const PopularPairs = ({ onPick }: { onPick: (f: string, t: string) => void }) => {
  return (
    <section className="mt-12 animate-fade-in [animation-delay:360ms]">
      <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Popular pairs
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PAIRS.map(([f, t]) => {
          const fc = getCurrency(f);
          const tc = getCurrency(t);
          return (
            <button
              key={`${f}-${t}`}
              onClick={() => onPick(f, t)}
              className="group glass flex items-center justify-between gap-2 rounded-2xl px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <span className="flex items-center gap-1.5 text-lg">
                <span>{fc.flag}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span>{tc.flag}</span>
              </span>
              <span className="font-display text-xs font-semibold tracking-wide text-muted-foreground transition-colors group-hover:text-foreground">
                {f}/{t}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

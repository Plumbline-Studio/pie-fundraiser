"use client";
import { useEffect, useState } from "react";
import { useGame, TARGETS } from "@/engine/store";
import { bus } from "@/engine/events";
import { FLAGS, PRICING } from "@/engine/config";

function ScreenSplat() {
  const [splat, setSplat] = useState(0);
  useEffect(
    () =>
      bus.on("facehit", () => {
        setSplat((s) => s + 1);
        setTimeout(() => setSplat((s) => Math.max(0, s - 1)), 450);
      }),
    []
  );
  if (!splat) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div className="splat-pop text-[9rem]">{"\u{1F967}"}</div>
    </div>
  );
}

function PledgeModal() {
  const open = useGame((s) => s.pledgeOpen);
  const setOpen = useGame((s) => s.setPledgeOpen);
  const buyPies = useGame((s) => s.buyPies);
  const [count, setCount] = useState(5);
  const [negative, setNegative] = useState(false);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-extrabold text-gray-900">Get more pies</h2>
        <p className="mt-1 text-sm text-gray-600">
          Every pie is a <b>${PRICING.perPie} pledge to United Way</b>.
        </p>
        <div className="mt-4 flex gap-2">
          {[1, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 rounded-xl border-2 py-3 text-center font-bold ${count === n ? "border-bank-red bg-red-50 text-bank-red" : "border-gray-200 text-gray-700"}`}
            >
              {n} {"\u{1F967}"}
              <div className="text-xs font-medium text-gray-500">${n * PRICING.perPie}</div>
            </button>
          ))}
        </div>
        {FLAGS.negativePies && (
          <label className="mt-4 flex items-center gap-3 rounded-xl border-2 border-gray-200 p-3">
            <input type="checkbox" checked={negative} onChange={(e) => setNegative(e.target.checked)} className="h-5 w-5 accent-bank-red" />
            <span className="text-sm">
              <b>Steal their pies</b> {"\u{1F608}"} — remove pies from their count instead. Same pledge, more mischief.
            </span>
          </label>
        )}
        <button onClick={() => buyPies(count, negative)} className="mt-4 w-full rounded-xl bg-bank-red py-3.5 font-extrabold text-white active:scale-95">
          Pledge ${count * PRICING.perPie} — grab {count} pie{count > 1 ? "s" : ""}
        </button>
        <p className="mt-3 text-center text-[11px] leading-snug text-gray-400">
          This app records pledges only. No payment information is ever collected — complete your gift through the campaign&apos;s usual channel.
        </p>
      </div>
    </div>
  );
}

export default function HUD() {
  const piesLeft = useGame((s) => s.piesLeft);
  const negative = useGame((s) => s.negative);
  const target = useGame((s) => s.target);
  const setTarget = useGame((s) => s.setTarget);
  const standings = useGame((s) => s.standings);
  const campaignTotal = useGame((s) => s.campaignTotal);
  const feed = useGame((s) => s.feed);
  const setPledgeOpen = useGame((s) => s.setPledgeOpen);
  const fakeFeedTick = useGame((s) => s.fakeFeedTick);
  const style = useGame((s) => s.style);
  const setStyle = useGame((s) => s.setStyle);

  useEffect(() => {
    const iv = setInterval(() => fakeFeedTick(), 5000 + Math.random() * 4000);
    return () => clearInterval(iv);
  }, [fakeFeedTick]);

  return (
    <>
      {/* standings strip */}
      <div className="absolute left-0 right-0 top-0 z-20 bg-white/85 backdrop-blur border-b border-gray-200">
        <div className="mx-auto flex max-w-xl items-center gap-1 overflow-x-auto px-2 py-1.5">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTarget(t.id)}
              className={`flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1 ${target === t.id ? "bg-red-50 ring-2 ring-bank-red" : ""}`}
            >
              <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">{t.label}</span>
              <span className="text-sm font-extrabold text-bank-red">{standings[t.id]} {"\u{1F967}"}</span>
            </button>
          ))}
          <div className="ml-auto shrink-0 pl-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Campaign</div>
            <div className="text-sm font-extrabold text-green-700">${campaignTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* activity feed */}
      <div className="pointer-events-none absolute left-0 right-0 top-14 z-20 mx-auto max-w-xl px-3">
        {feed.slice(0, 2).map((f) => (
          <div key={f.id} className="mb-1 w-fit max-w-full truncate rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
            {f.text}
          </div>
        ))}
      </div>

      {/* A/B style toggle — the demo's one research question */}
      <button
        onClick={() => setStyle(style === "stylized" ? "blocky" : "stylized")}
        className="absolute right-3 top-24 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-700 shadow"
      >
        {style === "stylized" ? "style: art ✨" : "style: blocky \u{1F9F1}"}
      </button>

      {/* bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/30 to-transparent pb-5 pt-8">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4">
          <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-gray-800 shadow">
            {piesLeft} {"\u{1F967}"} left {negative && <span title="negative pies armed">{"\u{1F608}"}</span>}
          </div>
          <div className="text-center text-xs font-semibold text-white drop-shadow">flick up to throw</div>
          <button onClick={() => setPledgeOpen(true)} className="rounded-full bg-bank-red px-4 py-2 text-sm font-extrabold text-white shadow active:scale-95">
            + pies
          </button>
        </div>
      </div>

      <ScreenSplat />
      <PledgeModal />
    </>
  );
}

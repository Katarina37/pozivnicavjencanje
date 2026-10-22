import { useEffect, useMemo, useRef, useState, type ReactNode, type SyntheticEvent, type CSSProperties, } from "react";


/* ================= PODACI – ovdje mijenjate sve ================= */
const CONFIG = {
  bride: "Marina",
  groom: "Jovan",
  date: new Date("2027-08-14T14:00:00"),
  dateText: "Subota, 14. avgust 2027.",
  intro:
    "Pozivamo vas da budete uz nas na početku našeg zajedničkog puta, jer je svaka radost veća kad je podijelimo s vama.",
  events: [
    { title: "Okupljanje", icon: "ikona-okupljanje.png", mapQuery: "",
      lines: [{ time: "08:00", place: "Kod mladoženje" }, { time: "10:00", place: "Kod mlade" }] },
    { title: "Crkveno vjenčanje", icon: "ikona-crkva.png", mapQuery: "Manastir Svete Petke",
      lines: [{ time: "15:00", place: "Manastir Svete Petke" }] },
    { title: "Građansko vjenčanje", icon: "opstina.png", mapQuery: "Opština Bijeljina",
      lines: [{ time: "16:00", place: "Opština Bijeljina" }] },
    { title: "Svečana proslava", icon: "ikona-case.png", mapQuery: "Svečani salon Millenium",
      lines: [{ time: "18:00", place: "Svečani salon Millenium" }] },
  ],
  venue: { name: "Svečani salon Millenium", address: "Dodajte tačnu adresu", mapQuery: "Svečani salon Millenium" },
  contacts: [
    { who: "Jovan", phone: "+387 66 030 134" },
    { who: "Marina", phone: "+387 66 430 101" },
  ],
  rsvpDeadline: "1. jula 2027.",
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbw6wpNkmWPEKsHvOKzL71TLmYR8bP2DUUr8GwC9oWABKeaBl1aeUNMGTA9TUrlpWNQ9/exec", // URL (Formspree, Google Apps Script...). Prazno = samo prikaže zahvalu
  music: "", // npr. "/audio/pjesma.mp3" (stavite fajl u public/audio/)
  showPlaceholders: true, // true = vidljivi isprekidani okviri gdje ide slika; kad završite stavite false
};

const MONTHS = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
const DAYS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
const mapLink = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* ================= Pomoćne komponente ================= */
/** Mjesto za sliku iz public/img/. Dok slike nema, vidi se označen okvir. */
function Slot({ src, label, ratio, className = "", fit = "cover" }: { src: string; label: string; ratio?: string; className?: string; fit?: "cover" | "contain" }) {
  const [err, setErr] = useState(false);
  if (err && !CONFIG.showPlaceholders) return null;
  return (
    <div className={`slot ${err ? "empty" : ""} ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {err ? (
        <span>{label}<small>public/img/{src}</small></span>
      ) : (
        <img src={`/img/${src}`} alt="" style={{ objectFit: fit }} onError={() => setErr(true)} />
      )}
    </div>
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${v ? "in" : ""} ${className}`}>{children}</div>;
}

function Wave({ bottom = false }: { bottom?: boolean }) {
  return (
    <svg className={`wave ${bottom ? "b" : ""}`} viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 0H1440V22C1200 62 1000 -8 720 32C440 70 240 4 0 40Z" fill="currentColor" />
    </svg>
  );
}

function Petals({ count = 14 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 10,
        delay: -Math.random() * 16,
        dur: 12 + Math.random() * 8,
        sway: (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40),
      })),
    [count]
  );
  return (
    <div className="petals" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            "--sway": `${p.sway}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

function BranchWave({ bottom = false }: { bottom?: boolean }) {
  return (
    <svg className={`bw ${bottom ? "b" : ""}`} viewBox="0 0 1120 293" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 0H1120V216L1092 213L1064 203L1036 196L1008 192L980 184L952 174L924 167L896 163L868 159L840 152L812 145L784 132L756 120L728 119L700 122L672 125L644 126L616 128L588 133L560 138L532 144L504 144L476 136L448 129L420 131L392 127L364 125L336 127L308 128L280 129L252 132L224 139L196 134L168 128L140 123L112 116L84 107L56 101L28 98L0 93Z" />
    </svg>
  );
}

function useCountdown(target: Date) {
  const calc = () => Math.max(0, target.getTime() - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor(ms / 1000);
  return [
    [Math.floor(s / 86400), "dana"],
    [Math.floor((s % 86400) / 3600), "sati"],
    [Math.floor((s % 3600) / 60), "min"],
    [s % 60, "sek"],
  ] as const;
}

/* ================= Aplikacija ================= */
export default function WeddingInvitation() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const clock = useCountdown(CONFIG.date);

  const [attending, setAttending] = useState<"da" | "ne">("da");
  const [guests, setGuests] = useState<string[]>([]);
  const [guestInput, setGuestInput] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function start() {
    setOpen(true);
    if (CONFIG.music) audio.current?.play().then(() => setPlaying(true)).catch(() => {});
  }
  function toggleSound() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else { a.pause(); setPlaying(false); }
  }
  function addGuest() {
    const n = guestInput.trim();
    if (n) { setGuests([...guests, n]); setGuestInput(""); }
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const extra = guestInput.trim();
    const allGuests = extra ? [...guests, extra] : guests;
    const data = { ime: f.get("ime"), dolazak: attending, gosti: attending === "da" ? allGuests : [], poruka: f.get("poruka") };
    setBusy(true);
    try {
      if (CONFIG.rsvpEndpoint) {
        const r = await fetch(CONFIG.     rsvpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        });
        if (!r.ok) throw new Error();
      }
      setSent(true);
    } catch {
      setError("Slanje nije uspjelo. Pokušajte ponovo ili nas pozovite.");
    } finally {
      setBusy(false);
    }
  }

  /* kalendar */
  const y = CONFIG.date.getFullYear(), m = CONFIG.date.getMonth(), d = CONFIG.date.getDate();
  const cells: (number | null)[] = [...Array((new Date(y, m, 1).getDay() + 6) % 7).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)];
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (t: Date) => `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}00`;
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Vjenčanje: ${CONFIG.groom} i ${CONFIG.bride}`)}&dates=${stamp(CONFIG.date)}/${stamp(new Date(CONFIG.date.getTime() + 10 * 3600e3))}&location=${encodeURIComponent(CONFIG.venue.mapQuery)}`;

  return (
    <div className="wi">
      <style>{css}</style>
      {CONFIG.music && <audio ref={audio} src={CONFIG.music} loop />}

      {/* UVOD – "klikni da otvoriš" */}
      <div className={`intro ${open ? "gone" : ""}`} aria-hidden={open}>
        <Slot src="uvod.png" label="POZADINA UVODA – cijeli ekran (cvijeće, luk, koverta...)" className="fill" />
        <div className="intro-in">
          <p className="eyebrow">Vjenčanje</p>
          <h1 className="script">{CONFIG.groom} &amp; {CONFIG.bride}</h1>
          <Slot src="koverta.png" label="KOVERTA" ratio="3/2" fit="contain" className="env" />
          <button className="pill" onClick={start}>klikni da otvoriš</button>
        </div>
      </div>

      <div className="page">
        {/* POČETAK */}
        <header className="hero">
          <Petals count={16}/>
        <div className="names">
          <h1 className="script">{CONFIG.groom} <i>&amp;</i> {CONFIG.bride}</h1>
        </div>
          <Slot src="scena.png" label="GLAVNA SLIKA – mladenci i manastir (vertikalna, omjer 3:4)" ratio="3/4" className="scena" />
        </header>

        <section className="sec">
          <Reveal>
            <p className="eyebrow">{CONFIG.dateText}</p>
            <p className="lead">{CONFIG.intro}</p>
          </Reveal>
        </section>

        {/* KALENDAR */}
        <section className="sec taupe tall">
          <BranchWave />
          <Slot src="grana-siroka.png" label="Široka grana s cvjetovima (gornja ivica)" ratio="1120/293" fit="contain" className="orn-wide top" />
          <Reveal>
            <h2 className="script">{MONTHS[m]}</h2>
            <p className="year">{y}</p>
            <div className="cal">
              {DAYS.map((x) => <b key={x}>{x}</b>)}
              {cells.map((c, i) => (
                <span key={i} className={c === d ? "me" : ""}>{c}</span>
              ))}
            </div>
            <a className="pill light" href={calUrl} target="_blank" rel="noreferrer">Dodaj u kalendar</a>
          </Reveal>
          <BranchWave bottom />
          <Slot src="grana-siroka.png" label="Široka grana s cvjetovima (donja ivica)" ratio="1120/293" fit="contain" className="orn-wide bot" />
          <Wave bottom />
        </section>

        {/* PLAN DANA */}
        <section className="sec plan">
          <Petals count={18}/>
          <Slot src="grana-siroka.png" label="Grana lijevo" ratio="1120/293" fit="contain" className="side sl" />
          <Slot src="grana-siroka.png" label="Grana desno" ratio="1120/293" fit="contain" className="side sr" />
          <Reveal><h2 className="script">Plan dana</h2></Reveal>
          {CONFIG.events.map((e) => (
            <Reveal key={e.title} className="ev">
              <Slot src={e.icon} label={`IKONA – ${e.title}`} ratio="1/1" fit="contain" className="ico" />
              <h3>{e.title}</h3>
              {e.lines.map((l) => (
                <p className="when" key={l.time + l.place}><b>{l.time}h</b><br />{l.place}</p>
              ))}
              {e.mapQuery && <a className="pill" href={mapLink(e.mapQuery)} target="_blank" rel="noreferrer">Otvori mapu</a>}
            </Reveal>
          ))}
        </section>

        {/* ODBROJAVANJE */}
        <section className="sec">
          <Reveal>
            <h2 className="script">Još samo</h2>
            <div className="clock" role="timer">
              {clock.map(([v, l]) => (
                <div key={l}><strong>{pad(v)}</strong><small>{l}</small></div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* POTVRDA DOLASKA */}
        <section className="sec taupe rsvp">
          <BranchWave />
          <Slot src="grana-siroka.png" label="Široka grana s cvjetovima (gornja ivica)" ratio="1120/293" fit="contain" className="orn-wide top" />
          <Reveal>
            <h2 className="script">Potvrdi dolazak</h2>
            <p className="lead sm">Molimo vas da potvrdite dolazak do {CONFIG.rsvpDeadline}<br />Vaša prijava nam pomaže u boljoj organizaciji.</p>
            {sent ? (
              <div className="thanks" role="status">
                <h3>Hvala vam!</h3>
                <p>{attending === "da" ? "Radujemo se što ćemo slaviti s vama." : "Žao nam je što nećete biti s nama. Hvala što ste nam javili."}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <input name="ime" placeholder="Ime i prezime *" required autoComplete="name" />
                <div className="seg" role="radiogroup" aria-label="Da li dolazite?">
                  <label className={attending === "da" ? "on" : ""}><input type="radio" checked={attending === "da"} onChange={() => setAttending("da")} />Dolazim</label>
                  <label className={attending === "ne" ? "on" : ""}><input type="radio" checked={attending === "ne"} onChange={() => setAttending("ne")} />Ne mogu doći</label>
                </div>
                {attending === "da" && (
                  <div className="guests">
                    <p>Ako ne dolazite sami, dodajte i ostale zvanice, jednu po jednu osobu.</p>
                    <div className="row">
                      <input value={guestInput} placeholder="Ime" onChange={(e) => setGuestInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGuest(); } }} />
                      <button type="button" className="pill ghost" onClick={addGuest}>Dodaj</button>
                    </div>
                    <ul>
                      {guests.map((g, i) => (
                        <li key={i}>{g}<button type="button" aria-label={`Ukloni ${g}`} onClick={() => setGuests(guests.filter((_, k) => k !== i))}>×</button></li>
                      ))}
                    </ul>
                  </div>
                )}
                <textarea name="poruka" rows={3} placeholder="Poruka mladencima (nije obavezno)" />
                {error && <p className="err" role="alert">{error}</p>}
                <button className="pill light big" disabled={busy}>{busy ? "Šaljem…" : "Potvrdi"}</button>
              </form>
            )}
          </Reveal>
          <BranchWave bottom />
          <Slot src="grana-siroka.png" label="Široka grana s cvjetovima (donja ivica)" ratio="1120/293" fit="contain" className="orn-wide bot" />
        </section>

        {/* PODNOŽJE */}
        <footer>
          <Slot src="prstenje.png" label="PRSTENJE" ratio="1/1" fit="contain" className="rings" />
          <p className="script big">{CONFIG.groom} &amp; {CONFIG.bride}</p>
          <p className="eyebrow">{CONFIG.dateText}</p>
          <div className="contacts">
            {CONFIG.contacts.map((p) => (
              <a key={p.who} href={`tel:${p.phone.replace(/\s/g, "")}`}>{p.who}<span>{p.phone}</span></a>
            ))}
          </div>
        </footer>
      </div>

      {CONFIG.music && open && (
        <button className="snd" onClick={toggleSound} aria-label={playing ? "Isključi muziku" : "Uključi muziku"}>♪</button>
      )}
    </div>
  );
}

/* ================= Stilovi ================= */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Pinyon+Script&family=Great+Vibes&family=Jost:wght@300;400;500&display=swap');
.wi{--w:#fbfaf8;--mist:#efedf0;--taupe:#a99a8e;--taupe2:#94857a;--taupe-d:#7a695c;--ink:#4b3f38;
  font-family:'Jost',sans-serif;color:var(--ink);background:#e6e1dc;line-height:1.65;min-height:100vh}
.wi *{box-sizing:border-box}
.wi h1,.wi h2,.wi h3,.wi p{margin:0}
.wi .page{max-width:560px;margin:0 auto;background:var(--w);position:relative;overflow:hidden;box-shadow:0 0 70px rgba(60,40,30,.15)}
.wi .script{font-family:'Pinyon Script',cursive;font-weight:400;line-height:1.05;color:var(--taupe-d)}
.wi .eyebrow{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--taupe-d)}
.wi .lead{font-family:'Cormorant Garamond',serif;font-size:22px;line-height:1.5;margin-top:16px}
.wi .lead.sm{font-size:18px;color:#fff}
.wi .sec{position:relative;padding:72px 30px;text-align:center}
.wi .sec h2{font-size:clamp(46px,12vw,64px);margin-bottom:12px}
.wi .mist{background:var(--mist)}

/* slike */
.wi .slot img{display:block;width:100%;height:100%}
.wi .slot.empty{display:grid;place-items:center;border:2px dashed #b3a294;background:rgba(169,154,142,.14);color:#5f5046;font-size:13px;line-height:1.4;padding:10px;text-align:center}
.wi .slot.empty small{display:block;margin-top:4px;opacity:.75;font-family:monospace;font-size:11px}
.wi .fill{position:absolute;inset:0}.wi .fill img{object-fit:cover}
.wi .fill.empty{border:0;background:none;place-items:start center;padding:14px 20px}
.wi .fill.empty span{font-size:11px;opacity:.55}.wi .fill.empty small{display:inline;margin-left:6px}
.wi .orn{position:absolute;top:0;width:44%;z-index:2;pointer-events:none}
.wi .tl{left:0}.wi .tr{right:0;transform:scaleX(-1)}
.wi .orn-wide{position:absolute;left:0;width:100%;z-index:2;pointer-events:none}
.wi .orn-wide.top{top:0}.wi .orn-wide.bot{bottom:0;transform:rotate(180deg)}

/* uvod */
.wi .intro{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:linear-gradient(#f4f1ed,#d9cfc5);transition:opacity 1s,visibility 1s}
.wi .intro.gone{opacity:0;visibility:hidden;pointer-events:none}
.wi .intro-in{position:relative;z-index:1;text-align:center;padding:24px;display:grid;gap:18px;justify-items:center}
.wi .intro .script{font-size:clamp(46px,12vw,66px)}
.wi .env{width:min(88vw,420px);margin-top:3vh;filter:drop-shadow(0 14px 22px rgba(90,70,55,.35));animation:float 3.5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@media(prefers-reduced-motion:reduce){.wi .env{animation:none}}
.wi .intro .pill{background:rgba(255,255,255,.55);color:var(--taupe-d);border:1px solid rgba(255,255,255,.9);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:15px 44px;font-size:18px;font-weight:700;color:#5f4e43;text-shadow:0 1px 2px rgba(255,255,255,.8);margin-top:4vh}

/* početak */
.wi .hero{position:relative;background:linear-gradient(#fbfaf8 0%,#ecebee 16%,#ecebee 82%,#fbfaf8 100%)}
.wi .names{text-align:center;padding:52px 16px 6px}
.wi .names .script{font-size:clamp(46px,12.5vw,70px);line-height:1.1;white-space:nowrap;color:#8b7a6d}
.wi .names i{font-size:.7em;color:var(--taupe);margin:0 .2em}
.wi .scena{width:100%;margin-top:-6px;-webkit-mask-image:linear-gradient(transparent,#000 12%,#000 86%,transparent);mask-image:linear-gradient(transparent,#000 12%,#000 86%,transparent)}
.wi .scena img{object-fit:cover}
.wi .hero .petals{z-index:2}

/* dugmad */
.wi .pill{display:inline-block;margin-top:22px;padding:13px 34px;border-radius:999px;border:1px solid #fff;cursor:pointer;text-decoration:none;
  font:500 15px 'Cormorant Garamond',serif;letter-spacing:.06em;color:#fff;background:linear-gradient(#b4a499,var(--taupe2));box-shadow:0 6px 14px rgba(90,70,55,.28)}
.wi .pill.light{background:#fff;color:var(--taupe-d);border-color:#fff}
.wi .pill.ghost{margin:0;box-shadow:none;background:transparent;color:#fff;padding:11px 20px}
.wi .pill.big{width:100%;margin-top:6px;font-size:18px}
.wi .pill:disabled{opacity:.6}
.wi .pill:focus-visible,.wi input:focus-visible,.wi textarea:focus-visible,.wi button:focus-visible{outline:2px solid var(--taupe-d);outline-offset:2px}

/* taupe sekcije */
.wi .taupe{background:linear-gradient(var(--taupe),var(--taupe2));color:#fff;padding-top:165px;padding-bottom:120px}
.wi .rsvp{padding-bottom:165px}
.wi .taupe.tall{padding-bottom:165px}
.wi .taupe h2{color:#fff}
.wi .wave{position:absolute;left:0;top:-1px;width:100%;height:44px;color:var(--w);z-index:1}
.wi .wave.b{top:auto;bottom:-1px;transform:rotate(180deg)}
.wi .bw{position:absolute;left:0;top:0;width:100%;aspect-ratio:1120/293;color:var(--w);z-index:1;display:block}
.wi .bw.b{top:auto;bottom:-2px;transform:rotate(180deg)}

.wi .year{letter-spacing:.4em;font-size:15px;margin-bottom:26px}
.wi .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px 0;max-width:340px;margin:0 auto 8px;font-family:'Cormorant Garamond',serif;font-size:20px}
.wi .cal b{font-weight:500;font-size:14px;opacity:.85;letter-spacing:.06em}
.wi .cal span{height:44px;display:grid;place-items:center;position:relative}
.wi .cal .me{color:var(--taupe-d);font-weight:600;z-index:0}
.wi .cal .me::before{content:"♥";position:absolute;inset:0;display:grid;place-items:center;font-size:64px;line-height:1;color:#fff;z-index:-1}

/* plan dana */
.wi .plan .ev{margin-top:54px}
.wi .ico{width:200px;margin:0 auto 10px}
.wi .ev h3{font:600 28px 'Cormorant Garamond',serif;color:var(--taupe-d)}
.wi .when{font-family:'Cormorant Garamond',serif;font-size:20px;line-height:1.3;margin-top:6px}
.wi .when + .when{margin-top:2px}
.wi .when b{font-size:22px;line-height:1.2}
.wi .when b{font-size:22px}
.wi .petals{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.wi .petals span{position:absolute;top:-5%;background:radial-gradient(circle at 30% 30%,#fff,#f7f1ea 70%);border-radius:80% 0 80% 0;box-shadow:0 2px 6px rgba(90,70,55,.3);opacity:.95;animation:fall linear infinite}
@keyframes fall{
  0%{top:-5%;transform:translateX(0) rotate(0deg)}
  50%{transform:translateX(var(--sway)) rotate(180deg)}
  100%{top:105%;transform:translateX(0) rotate(360deg)}
}
@media(prefers-reduced-motion:reduce){.wi .petals{display:none}}
.wi .side{position:absolute;width:60%;z-index:0;pointer-events:none;opacity:.95}
.wi .side.sl{left:-38%;top:18%;transform:rotate(90deg);transform-origin:center}
.wi .side.sr{right:-38%;top:52%;transform:rotate(-90deg);transform-origin:center}
.wi .plan{background:linear-gradient(#fbfaf8 0%,#efe6dd 25%,#e3d5c8 55%,#efe6dd 85%,#fbfaf8 100%)}

/* mapa */
.wi .map{margin-top:26px;height:320px;border-radius:220px 220px 14px 14px;overflow:hidden;border:6px solid #fff;box-shadow:0 10px 24px rgba(60,40,30,.15)}
.wi .map iframe{width:100%;height:100%;border:0}

/* odbrojavanje */
.wi .clock{display:flex;justify-content:center;gap:12px;margin-top:26px}
.wi .clock div{width:76px;height:76px;border-radius:50%;background:linear-gradient(#b4a499,var(--taupe2));color:#fff;display:grid;place-content:center;box-shadow:0 8px 16px rgba(90,70,55,.28)}
.wi .clock strong{font:500 28px/1 'Cormorant Garamond',serif;font-variant-numeric:tabular-nums}
.wi .clock small{font-size:11px;letter-spacing:.1em;margin-top:3px}


/* forma */
.wi form{display:grid;gap:14px;max-width:420px;margin:26px auto 0;text-align:left}
.wi input:not([type=radio]),.wi textarea{width:100%;font:400 16px 'Jost',sans-serif;color:var(--ink);padding:14px 20px;background:#fff;border:0;border-radius:26px}
.wi textarea{border-radius:22px}
.wi .seg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wi .seg label{text-align:center;padding:12px;border:1px solid rgba(255,255,255,.7);border-radius:999px;cursor:pointer}
.wi .seg label.on{background:#fff;color:var(--taupe-d)}
.wi .seg input{position:absolute;opacity:0;pointer-events:none}
.wi .seg label:focus-within{outline:2px solid #fff;outline-offset:2px}
.wi .guests p{font-size:14px;margin-bottom:10px;text-align:center;opacity:.95}
.wi .row{display:flex;gap:10px;align-items:center}
.wi .guests ul{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.wi .guests li{background:rgba(255,255,255,.25);border-radius:999px;padding:4px 6px 4px 14px;display:flex;align-items:center;gap:6px}
.wi .guests li button{border:0;background:#fff;color:var(--taupe-d);border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:16px;line-height:1}
.wi .err{color:#fff;background:rgba(120,40,30,.45);padding:8px 14px;border-radius:14px;font-size:14px}
.wi .thanks{max-width:420px;margin:26px auto 0;padding:34px 22px;border:1px solid #fff;border-radius:120px 120px 14px 14px}
.wi .thanks h3{font:500 34px 'Cormorant Garamond',serif}

/* podnožje */
.wi footer{text-align:center;padding:60px 24px 70px}
.wi .rings{width:110px;margin:0 auto 6px}
.wi .script.big{font-size:56px;margin-bottom:6px}
.wi .contacts{display:flex;justify-content:center;gap:34px;flex-wrap:wrap;margin-top:34px}
.wi .contacts a{display:grid;color:var(--ink);text-decoration:none;font:500 20px 'Cormorant Garamond',serif}
.wi .contacts span{font:400 14px 'Jost',sans-serif;color:var(--taupe-d)}
.wi .snd{position:fixed;left:14px;bottom:14px;z-index:40;width:44px;height:44px;border-radius:50%;border:0;background:rgba(122,105,92,.85);color:#fff;font-size:20px;cursor:pointer}
.wi .snd[aria-label^="Uključi"]{opacity:.6}

/* animacije */
.wi .rv{opacity:0;transform:translateY(22px);transition:opacity .9s ease,transform .9s ease}
.wi .rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.wi .rv{opacity:1;transform:none;transition:none}.wi .intro{transition:none}}
`;

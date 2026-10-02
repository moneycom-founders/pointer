"use client";

// ======================================================================
// Pointer — Executive Landing · v3.1 · Swiss Typography + Anti-AI Clutter
// app/page.tsx
// ======================================================================

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  animate,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────
type KanbanStatus = "entrada" | "qualificando" | "agendado";
type SimState     = "idle" | "running" | "done";

// ─── Animation constants ─────────────────────────────────────────────────────
const EASE        = [0.16, 1, 0.3, 1] as const;
const SPRING      = { type: "spring", stiffness: 260, damping: 26 } as const;

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.68, ease: EASE } },
};
const reveal = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// ─── Chat messages ────────────────────────────────────────────────────────────
type ChatMsg =
  | { id: number; from: "patient" | "pointer"; type: "text";  text: string; time: string }
  | { id: number; from: "patient";             type: "audio"; duration: string; time: string };

const CHAT: ChatMsg[] = [
  { id: 0, from: "patient", type: "audio", duration: "0:18", time: "18:47" },
  { id: 1, from: "pointer", type: "text",  time: "18:47",
    text: "Olá, Ricardo! Recebi seu áudio. A Dra. Renata tem vaga nesta quinta às 14h ou sexta às 16h30. Qual desses horários fica melhor para você?" },
  { id: 2, from: "patient", type: "text",  text: "Quinta às 14h, por favor!", time: "18:48" },
  { id: 3, from: "pointer", type: "text",  time: "18:48",
    text: "Perfeito! Horário reservado no sistema. Enviei o comprovante e a localização da clínica. Mais alguma dúvida? 😊" },
];

// ─── Kanban columns ──────────────────────────────────────────────────────────
const COLS: { key: KanbanStatus; label: string }[] = [
  { key: "entrada",      label: "Entrada"        },
  { key: "qualificando", label: "Qualificando"   },
  { key: "agendado",     label: "Confirmado ✓"   },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(v);
}

function useAnimatedNumber(target: number) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const ctrl = animate(prev.current, target, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    prev.current = target;
    return () => ctrl.stop();
  }, [target]);
  return val;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PointerPage() {

  // ── Simulation state ──────────────────────────────────────────────────────
  const [sim,         setSim]         = useState<SimState>("idle");
  const [msgs,        setMsgs]        = useState<Set<number>>(new Set());
  const [typing,      setTyping]      = useState(false);
  const [kanban,      setKanban]      = useState<KanbanStatus>("entrada");
  const [done,        setDone]        = useState(false);
  const timers                        = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatContainerRef              = useRef<HTMLDivElement>(null);
  const showroomRef                   = useRef<HTMLDivElement>(null);

  // ── Calculator state ──────────────────────────────────────────────────────
  const [consultas,   setConsultas]   = useState(150);
  const [ticket,      setTicket]      = useState(350);
  const recovered   = Math.round(consultas * 0.18);
  const monthly     = recovered * ticket;
  const annual      = monthly * 12;
  const annualDisp  = useAnimatedNumber(annual);
  const monthlyDisp = useAnimatedNumber(monthly);

  const cPct = ((consultas - 50)  / 450)  * 100;
  const tPct = ((ticket    - 150) / 1350) * 100;

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function startSim() {
    if (sim === "running") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSim("running"); setMsgs(new Set()); setTyping(false);
    setKanban("entrada"); setDone(false);

    const s = (fn: () => void, ms: number) =>
      timers.current.push(setTimeout(fn, ms));

    s(() => setMsgs(new Set([0])),                                  400);
    s(() => { setTyping(true); setKanban("qualificando"); },        1200);
    s(() => { setTyping(false); setMsgs(new Set([0, 1])); },       2900);
    s(() => setMsgs(new Set([0, 1, 2])),                           4600);
    s(() => setTyping(true),                                        5300);
    s(() => {
      setTyping(false); setMsgs(new Set([0, 1, 2, 3]));
      setKanban("agendado");
    },                                                               6800);
    s(() => { setDone(true); setSim("done"); },                    7600);
  }

  function resetSim() {
    timers.current.forEach(clearTimeout);
    setSim("idle"); setMsgs(new Set()); setTyping(false);
    setKanban("entrada"); setDone(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white overflow-x-hidden selection:bg-emerald-500/20">

      {/* ── SUBTLE AMBIENT (single, minimal) ─────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 select-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1,  y: 0   }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] backdrop-blur-md bg-[#0B0F17]/80"
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-[58px] flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/pointer-logo.png"
              alt="Pointer"
              width={26}
              height={26}
              className="object-contain"
            />
            <span className="text-[15px] font-semibold tracking-tight text-white">Pointer</span>
          </div>

          {/* Nav — só o essencial */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Demonstração", href: "#showroom"  },
              { label: "Calculadora",  href: "#calculadora" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] text-white/35 hover:text-white/80 transition-colors duration-150 font-medium"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA do header */}
          <motion.a
            href="#agendar"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0B0F17] text-[12px] font-semibold tracking-tight hover:bg-white/90 transition-colors"
          >
            Agendar Implantação
            <ChevronRight className="w-3 h-3" />
          </motion.a>
        </div>
      </motion.header>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="relative pt-[120px] pb-20 px-5 md:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge contextual */}
          <motion.div variants={fadeUp} className="flex justify-center mb-7">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] text-[10.5px] font-medium tracking-[0.12em] text-white/50 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              Tecnologia de Agendamento para Clínicas
            </span>
          </motion.div>

          {/* H1 — imponente, direto */}
          <motion.h1
            variants={fadeUp}
            className="text-[38px] sm:text-[52px] md:text-[62px] font-bold leading-[1.06] tracking-[-0.02em] mb-6 text-white"
          >
            Sua clínica perde consultas<br className="hidden sm:block" />
            <span className="text-white/50"> todos os dias após as 18h.</span>
          </motion.h1>

          {/* Sub — ROI focus, sem fluff */}
          <motion.p
            variants={fadeUp}
            className="text-[17px] text-white/45 max-w-xl mx-auto mb-10 leading-[1.75] font-light"
          >
            O Pointer qualifica pacientes e agenda consultas no seu calendário
            em <strong className="text-white/80 font-semibold">3 segundos</strong>.
            Sem secretária sobrecarregada.
          </motion.p>

          {/* CTA único + dominante */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <motion.button
              onClick={() => showroomRef.current?.scrollIntoView({ behavior: "smooth" })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-[15px] tracking-tight transition-colors shadow-lg shadow-emerald-500/20"
            >
              Ver Demonstração Interativa
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Barra de valor */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 items-center justify-center"
          >
            {[
              { title: "Áudios e Textos",       sub: "Ouve mensagens de voz e responde no tom da sua clínica" },
              { title: "Transbordo 1-Clique",    sub: "Sua equipe assume qualquer atendimento quando quiser" },
              { title: "Agenda Sincronizada",    sub: "Conexão direta com Google Agenda e sistemas clínicos" },
            ].map(({ title, sub }, i) => (
              <span key={i} className="flex items-start gap-2 max-w-[180px] sm:max-w-none">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-left">
                  <span className="text-[12px] font-semibold text-white/70 block leading-tight">{title}</span>
                  <span className="text-[11px] text-white/30 leading-snug hidden sm:block">{sub}</span>
                </span>
                {i < 2 && (
                  <span className="ml-4 h-8 w-px bg-white/[0.08] inline-block self-center hidden lg:inline-block" />
                )}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══ SHOWROOM ═════════════════════════════════════════════════════ */}
      <section id="showroom" ref={showroomRef} className="px-5 md:px-8 py-24">
        <div className="max-w-5xl mx-auto">

          {/* Section label */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-10"
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/30 uppercase mb-3">
              Demonstração Interativa
            </p>
            <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight text-white leading-tight">
              Do &ldquo;olá&rdquo; ao agendamento em menos de 8 segundos.
            </h2>
          </motion.div>

          {/* Disparo */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              onClick={sim === "done" ? resetSim : startSim}
              disabled={sim === "running"}
              whileHover={sim !== "running" ? { scale: 1.02 } : {}}
              whileTap={sim  !== "running" ? { scale: 0.97 } : {}}
              className={[
                "flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-[14px] transition-all duration-200",
                sim === "running"
                  ? "bg-white/[0.04] border border-white/[0.06] text-white/20 cursor-not-allowed"
                  : sim === "done"
                  ? "bg-white/[0.05] border border-white/[0.12] text-white hover:bg-white/[0.09]"
                  : "bg-[#0F172A] border border-white/[0.12] text-white hover:border-white/25",
              ].join(" ")}
            >
              {sim === "running" ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white/70 inline-block"
                  />
                  Simulando…
                </>
              ) : sim === "done" ? (
                <>↩ Reiniciar Simulação</>
              ) : (
                <>▶ Simular Paciente Agora</>
              )}
            </motion.button>

            <AnimatePresence>
              {done && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] text-emerald-400 font-medium"
                >
                  Ciclo completo em 7.6s · Zero intervenção humana
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Container único — borda ultrafina */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="border border-slate-800 rounded-2xl overflow-hidden bg-[#111827]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* ── Lado A: WhatsApp ─────────────────────────────────── */}
              <div className="p-6 border-b border-white/[0.07] lg:border-b-0 lg:border-r">
                {/* Label */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-white/25 uppercase">
                    WhatsApp · Canal de Entrada
                  </span>
                </div>

                {/* Phone chrome */}
                <div className="max-w-[280px] mx-auto">
                  <div
                    className="rounded-[22px] overflow-hidden border border-white/[0.07]"
                    style={{ background: "#111B21" }}
                  >
                    {/* Topbar */}
                    <div
                      className="flex items-center gap-2.5 px-4 py-2.5"
                      style={{ background: "#202C33" }}
                    >
                      <Image
                        src="/atendente.jpg"
                        alt="Maria Silva"
                        width={40}
                        height={40}
                        className="rounded-full w-10 h-10 object-cover border border-emerald-500/30 shrink-0"
                      />
                      <div>
                        <p className="text-white text-[11px] font-semibold leading-none">Maria Silva · Recepção Integrada</p>
                        <p className="text-[9px] text-emerald-400 mt-0.5">Online agora · Resposta imediata</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div
                      ref={chatContainerRef}
                      className="px-3 pt-3 pb-2 flex flex-col gap-2 overflow-y-auto"
                      style={{ minHeight: 320, maxHeight: 320, background: "#111B21" }}
                    >
                      {sim === "idle" && (
                        <div className="flex-1 flex items-center justify-center py-10">
                          <p className="text-white/12 text-[11px] text-center">
                            Aguardando início da simulação…
                          </p>
                        </div>
                      )}

                      <AnimatePresence>
                        {CHAT.map((m) =>
                          msgs.has(m.id) ? (
                            <motion.div
                              key={m.id}
                              initial={{ opacity: 0, y: 10, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0,  scale: 1 }}
                              transition={{ duration: 0.28, ease: EASE }}
                              className={m.from === "patient" ? "flex justify-start" : "flex justify-end"}
                            >
                              {/* ── Audio bubble ── */}
                              {m.type === "audio" ? (
                                <div
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-tr-2xl rounded-b-2xl max-w-[86%] shadow-sm"
                                  style={{ background: "#1F2C34" }}
                                >
                                  {/* Play button */}
                                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                  {/* Waveform */}
                                  <svg width="72" height="20" viewBox="0 0 72 20" fill="none" className="shrink-0">
                                    {[2,4,7,5,9,6,10,8,6,4,8,5,7,4,3,6,9,7,5,3,6,8,5,4].map((h, i) => (
                                      <rect
                                        key={i}
                                        x={i * 3}
                                        y={(20 - h * 1.6) / 2}
                                        width="2"
                                        height={h * 1.6}
                                        rx="1"
                                        fill="rgba(255,255,255,0.35)"
                                      />
                                    ))}
                                  </svg>
                                  {/* Duration */}
                                  <div className="flex flex-col items-end shrink-0">
                                    <span className="text-white/60 text-[9px] tabular-nums">{m.duration}</span>
                                    <span className="text-white/22 text-[9px] mt-0.5">{m.time}</span>
                                  </div>
                                </div>
                              ) : (
                                /* ── Text bubble ── */
                                <div
                                  className={`text-white text-[11.5px] px-3 py-2 max-w-[88%] leading-relaxed whitespace-pre-line shadow-sm ${
                                    m.from === "patient"
                                      ? "rounded-tr-2xl rounded-b-2xl"
                                      : "rounded-tl-2xl rounded-b-2xl"
                                  }`}
                                  style={{ background: m.from === "patient" ? "#1F2C34" : "#005C4B" }}
                                >
                                  <p>{m.type === "text" ? m.text : ""}</p>
                                  <p className="text-white/22 text-[9px] text-right mt-1">
                                    {m.time}{m.from === "pointer" ? " ✓✓" : ""}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          ) : null
                        )}

                        {typing && (
                          <motion.div
                            key="typing"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-end"
                          >
                            <div
                              className="rounded-tl-2xl rounded-b-2xl px-4 py-2.5 flex gap-1.5 items-center"
                              style={{ background: "#005C4B" }}
                            >
                              {[0, 0.16, 0.32].map((delay, i) => (
                                <motion.span
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full bg-white/45"
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.75, delay, ease: "easeInOut" }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Input decorativo */}
                    <div
                      className="flex items-center gap-2 px-3 py-2"
                      style={{ background: "#202C33" }}
                    >
                      <div
                        className="flex-1 rounded-full px-3 py-1.5 text-white/18 text-[10px]"
                        style={{ background: "#2A3942" }}
                      >
                        Mensagem
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-600/70 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Lado B: Mini-Kanban ──────────────────────────────── */}
              <div className="p-6 bg-[#0F1623]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-white/25 uppercase">
                    Pipeline · Tempo Real
                  </span>
                </div>

                <LayoutGroup>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {COLS.map((col) => {
                      const isActive = kanban === col.key;
                      const isConfirmed = col.key === "agendado";
                      return (
                        <div key={col.key} className="flex flex-col gap-2">
                          {/* Column header */}
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                col.key === "entrada"      ? "bg-slate-400" :
                                col.key === "qualificando" ? "bg-amber-400"  :
                                "bg-emerald-400"
                              }`}
                            />
                            <span className="text-[9.5px] text-white/30 font-medium leading-tight">
                              {col.label}
                            </span>
                          </div>

                          {/* Drop zone */}
                          <div className="min-h-[140px] rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
                            <AnimatePresence mode="popLayout">
                              {isActive && (
                                <motion.div
                                  key="card"
                                  layoutId="kanban-card"
                                  initial={{ opacity: 0, scale: 0.84 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{   opacity: 0, scale: 0.84 }}
                                  transition={{ ...SPRING }}
                                  className={`rounded-lg border p-3 ${
                                    isConfirmed
                                      ? "border-emerald-500/25 bg-emerald-500/10"
                                      : col.key === "qualificando"
                                      ? "border-amber-500/20 bg-amber-500/8"
                                      : "border-slate-500/20 bg-slate-500/8"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                                        isConfirmed ? "bg-emerald-600" :
                                        col.key === "qualificando" ? "bg-amber-600" : "bg-slate-600"
                                      }`}
                                    >
                                      R
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-white text-[10px] font-semibold leading-none truncate">
                                        Ricardo Mendes
                                      </p>
                                      <p className="text-white/30 text-[8.5px] mt-0.5">Consulta Avaliação</p>
                                    </div>
                                  </div>
                                  <p className="text-[8.5px] text-white/30 flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5 shrink-0" />
                                    30/09 · 14:00
                                  </p>

                                  <AnimatePresence>
                                    {isConfirmed && done && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ delay: 0.15, duration: 0.28 }}
                                        className="mt-2 flex items-center gap-1 text-emerald-400 overflow-hidden"
                                      >
                                        <Check className="w-2.5 h-2.5 shrink-0" />
                                        <span className="text-[8.5px] font-semibold">Confirmado</span>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </LayoutGroup>

                {/* Status bar */}
                <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                  />
                  <span className="text-[9.5px] text-white/20">
                    Recepção ativa · Tom de voz da sua clínica · Operação 24/7
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nota de supervisão humana */}
          <p className="mt-5 text-[11px] text-white/22 text-center leading-relaxed">
            <span className="text-white/35 font-medium">Transbordo imediato:</span>{" "}
            sua equipe pode intervir e assumir qualquer conversa com um único clique.
          </p>
        </div>
      </section>

      {/* ══ CALCULADORA DE RECEITA OCULTA ════════════════════════════════ */}
      <section id="calculadora" className="px-5 md:px-8 py-24 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12"
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/30 uppercase mb-3">
              Calculadora de Receita Oculta
            </p>
            <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight text-white leading-tight">
              Quanto sua clínica está perdendo<br className="hidden sm:block" />
              <span className="text-white/45"> toda semana?</span>
            </h2>
          </motion.div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {/* Valor principal — tipografia grande */}
            <div className="mb-12">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/25 uppercase mb-2">
                Receita anual recuperada
              </p>
              <p className="text-[56px] sm:text-[72px] md:text-[88px] font-bold text-emerald-400 tracking-[-0.03em] leading-none tabular-nums">
                {fmtBRL(annualDisp)}
              </p>
              <p className="text-[14px] text-white/30 mt-3">
                {fmtBRL(monthlyDisp)}/mês · {recovered} consultas recuperadas
              </p>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Consultas mensais */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-medium text-white/40 tracking-wide">
                    Consultas mensais
                  </label>
                  <span className="text-[13px] font-bold text-white tabular-nums">{consultas}</span>
                </div>
                <input
                  type="range" min={50} max={500} step={10} value={consultas}
                  onChange={(e) => setConsultas(Number(e.target.value))}
                  className="pointer-range w-full h-[2px] rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right,#10B981 ${cPct}%,rgba(255,255,255,0.07) ${cPct}%)` }}
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-white/15">
                  <span>50</span><span>500</span>
                </div>
              </div>

              {/* Ticket médio */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-medium text-white/40 tracking-wide">
                    Ticket médio por consulta
                  </label>
                  <span className="text-[13px] font-bold text-white tabular-nums">{fmtBRL(ticket)}</span>
                </div>
                <input
                  type="range" min={150} max={1500} step={50} value={ticket}
                  onChange={(e) => setTicket(Number(e.target.value))}
                  className="pointer-range w-full h-[2px] rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right,#10B981 ${tPct}%,rgba(255,255,255,0.07) ${tPct}%)` }}
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-white/15">
                  <span>R$ 150</span><span>R$ 1.500</span>
                </div>
              </div>
            </div>

            {/* Nota metodológica */}
            <p className="text-[11px] text-white/20 leading-relaxed border-t border-white/[0.05] pt-6">
              Taxa de recuperação de 18% aplicada sobre leads perdidos por demora ou fora do horário.
              Baseado em dados reais de clínicas parceiras em operação há 90+ dias.
            </p>

            {/* CTA final */}
            <div className="mt-8">
              <motion.a
                href="#agendar"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-[15px] tracking-tight transition-colors shadow-lg shadow-emerald-500/20"
              >
                Quero recuperar essa receita
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="px-5 md:px-8 py-8 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/pointer-logo.png"
              alt="Pointer"
              width={18}
              height={18}
              className="object-contain opacity-60"
            />
            <span className="text-white/35 text-[13px] font-semibold">Pointer</span>
          </div>
          <p className="text-white/18 text-[11px]">
            © 2026 Pointer · Agendamento autônomo para clínicas premium.
          </p>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[10px] text-white/20">Sistema operacional</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { ArrowRight, Headset, Send, X } from "lucide-react";
import { answer, answerIntent, GREETING, type Reply } from "@/lib/chat";
import { prefersReducedMotion } from "@/lib/motion";
import { company, contact } from "@/lib/site";

/**
 * Floating assistant.
 *
 * **The icon is a headset, not a speech bubble.** A bubble says "there is a
 * chat window here", which is the least interesting thing about it; on a site
 * selling contracted IT support, a helpdesk and 4-hour onsite response, a
 * headset says *who* is on the other end. It is the company's own product
 * rendered as an affordance, it is unambiguous at 22px, and it does not
 * collide with the `MessageSquare` marks used inside the pages. Swapping it
 * back is a one-line import change if that judgement is ever reversed.
 *
 * Hover and press are deliberately opposite movements, so the two states are
 * never mistaken for each other:
 *   - **hover** goes outward — the button lifts and grows, ink turns brand
 *     orange, and a ring expands off the edge,
 *   - **press** goes inward — it compresses under the finger and the shared
 *     `[data-ripple]` wash runs from the point of contact.
 * Both live in `.chat-fab` in globals.css; `press.tsx` supplies the ripple and
 * the touch-capable `[data-pressed]` state.
 *
 * The answers come from `lib/chat.ts`, which reads `site.ts`. Nothing is typed
 * out twice and nothing here decides what is true.
 */

/** Delay before the greeting bubble appears, so it is not part of page load. */
const NUDGE_DELAY_MS = 2600;
/** How long the assistant "types" before an answer lands. */
const TYPING_MS = 520;

type Message =
  | { id: number; from: "bot"; reply: Reply }
  | { id: number; from: "user"; text: string };

let nextId = 0;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  /** The label floating above the launcher. Dismissed for the session. */
  const [nudge, setNudge] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId++, from: "bot", reply: GREETING },
  ]);

  const panelId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const shown = timers.current;
    return () => {
      for (const t of shown) window.clearTimeout(t);
    };
  }, []);

  /* The nudge is a session-scoped courtesy: once dismissed or once the panel
     has been opened, it does not come back and pester. */
  useEffect(() => {
    try {
      if (sessionStorage.getItem("hpe:chat-nudge")) return;
    } catch {
      /* Storage blocked: show it, it is only a label. */
    }
    const t = window.setTimeout(() => setNudge(true), NUDGE_DELAY_MS);
    timers.current.push(t);
    return () => window.clearTimeout(t);
  }, []);

  const dismissNudge = useCallback(() => {
    setNudge(false);
    try {
      sessionStorage.setItem("hpe:chat-nudge", "1");
    } catch {
      /* Storage blocked: it reappears next navigation, which is acceptable. */
    }
  }, []);

  /* New content always ends up in view. `auto` under reduced motion, matching
     `back-to-top.tsx` — a long smooth scroll is the movement that preference
     is actually asking about. */
  useEffect(() => {
    const log = logRef.current;
    if (!log || !open) return;
    log.scrollTo({
      top: log.scrollHeight,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [messages, typing, open]);

  /* Escape closes and hands focus back to the launcher, or a keyboard user is
     stranded inside a panel they cannot leave. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      fabRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const respond = useCallback((reply: Reply) => {
    // Reduced motion gets the answer immediately: a typing indicator is three
    // animated dots and a delay, both of which are the thing being declined.
    if (prefersReducedMotion()) {
      setMessages((m) => [...m, { id: nextId++, from: "bot", reply }]);
      return;
    }
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId++, from: "bot", reply }]);
    }, TYPING_MS);
    timers.current.push(t);
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((m) => [...m, { id: nextId++, from: "user", text: trimmed }]);
      respond(answer(trimmed));
    },
    [respond],
  );

  const runSuggestion = useCallback(
    (label: string, intent: string) => {
      setMessages((m) => [...m, { id: nextId++, from: "user", text: label }]);
      respond(answerIntent(intent));
    },
    [respond],
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    send(input.value);
    input.value = "";
  };

  const toggle = () => {
    dismissNudge();
    setOpen((v) => !v);
  };

  /** Only the newest bot turn offers chips — older ones would stack up. */
  const lastBot = [...messages].reverse().find((m) => m.from === "bot");

  return (
    <div className="chat" data-open={open ? "" : undefined}>
      {/*
        The floating label. A real button, not a tooltip: it is the larger and
        more obvious target of the two, and on touch there is no hover state to
        reveal a tooltip in the first place.
      */}
      {/*
        The standing label. Always above the launcher when the panel is shut,
        so the control is never a bare icon a visitor has to guess at — the
        larger prompt below replaces it for the first two and a half seconds of
        the session and then hands the space back.
      */}
      {!nudge && !open && (
        <button
          type="button"
          className="chat-tag"
          onClick={toggle}
          // The launcher is the real control and carries the accessible name;
          // this is the same action twice, so it is not announced again.
          tabIndex={-1}
          aria-hidden="true"
        >
          Chat with us
        </button>
      )}

      {nudge && !open && (
        <div className="chat-nudge">
          <button
            type="button"
            className="chat-nudge__body"
            onClick={toggle}
            data-press="toggle"
          >
            <span className="chat-nudge__title">Need IT support?</span>
            <span className="chat-nudge__text">
              Ask about coverage, response times or a quote.
            </span>
          </button>
          <button
            type="button"
            className="chat-nudge__close"
            onClick={dismissNudge}
            aria-label="Dismiss"
          >
            <X size={13} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={toggle}
        onMouseEnter={dismissNudge}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close chat" : `Chat with ${company.name}`}
        data-ripple=""
        className="chat-fab"
      >
        {/* Both glyphs are mounted so the swap can cross-fade and rotate
            rather than pop. */}
        <span className="chat-fab__icon" data-glyph="rest" aria-hidden="true">
          <Headset size={22} strokeWidth={1.75} />
        </span>
        <span className="chat-fab__icon" data-glyph="open" aria-hidden="true">
          <X size={21} strokeWidth={2.25} />
        </span>
        {/* Expanding ring: the hover half of the two states. */}
        <span className="chat-fab__ring" aria-hidden="true" />
        {/* Unread-style dot, dropped for good once the panel has been opened. */}
        {!open && <span className="chat-fab__dot" aria-hidden="true" />}
      </button>

      <div
        id={panelId}
        className="chat-panel"
        role="dialog"
        aria-label={`${company.name} assistant`}
        /*
         * Hidden rather than unmounted, so the panel keeps the conversation
         * across opens and has something to animate out of. `inert` is what
         * takes its controls out of the tab order and out of the accessibility
         * tree — `visibility: hidden` in CSS does the first but leaves the
         * closed panel readable to a screen reader mid-transition.
         */
        inert={!open}
      >
        <header className="chat-panel__head">
          <span className="chat-panel__avatar" aria-hidden="true">
            <Headset size={17} strokeWidth={1.75} />
          </span>
          <span className="chat-panel__id">
            <strong>{company.name}</strong>
            <span className="chat-panel__status">
              Assistant · replies instantly
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              fabRef.current?.focus();
            }}
            className="chat-panel__close"
            aria-label="Close chat"
          >
            <X size={17} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </header>

        <div
          ref={logRef}
          className="chat-log"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((message) =>
            message.from === "user" ? (
              <p key={message.id} className="chat-msg chat-msg--user">
                {message.text}
              </p>
            ) : (
              <div key={message.id} className="chat-msg chat-msg--bot">
                {message.reply.body.map((paragraph, i) => (
                  <p key={i} className="chat-msg__p">
                    {paragraph}
                  </p>
                ))}
                {message.reply.links && (
                  <div className="chat-msg__links">
                    {message.reply.links.map((link) =>
                      link.href.startsWith("/") ? (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="chat-link"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                          <ArrowRight
                            size={13}
                            strokeWidth={2.25}
                            aria-hidden="true"
                          />
                        </Link>
                      ) : (
                        <a key={link.href} href={link.href} className="chat-link">
                          {link.label}
                          <ArrowRight
                            size={13}
                            strokeWidth={2.25}
                            aria-hidden="true"
                          />
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            ),
          )}

          {typing && (
            <p className="chat-msg chat-msg--bot chat-typing">
              <span className="sr-only">Typing</span>
              <span className="chat-typing__dot" aria-hidden="true" />
              <span className="chat-typing__dot" aria-hidden="true" />
              <span className="chat-typing__dot" aria-hidden="true" />
            </p>
          )}
        </div>

        {lastBot?.from === "bot" && lastBot.reply.suggestions && (
          <div className="chat-chips">
            {lastBot.reply.suggestions.map((s) => (
              <button
                key={s.intent}
                type="button"
                onClick={() => runSuggestion(s.label, s.intent)}
                className="chat-chip"
                data-press="toggle"
                data-ripple=""
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <form className="chat-form" onSubmit={onSubmit}>
          <label htmlFor={`${panelId}-input`} className="sr-only">
            Your message
          </label>
          <input
            ref={inputRef}
            id={`${panelId}-input`}
            name="message"
            type="text"
            autoComplete="off"
            maxLength={400}
            placeholder="Ask about services, coverage, SLA…"
            className="chat-form__input"
          />
          <button type="submit" className="chat-form__send" aria-label="Send">
            <Send size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </form>

        <p className="chat-foot">
          Automated assistant. For anything binding,{" "}
          <a href={`tel:${contact.phoneDial}`}>{contact.phoneDisplay}</a> reaches
          the office.
        </p>
      </div>
    </div>
  );
}

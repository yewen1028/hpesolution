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
import { GridPattern } from "@/components/grid-pattern";
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

  /** Controlled now, because the ghost layer has to mirror it exactly. */
  const [value, setValue] = useState("");
  /** Set when a completion is taken, cleared the moment the text is edited. */
  const acceptedIntent = useRef<string | null>(null);

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

  const toggle = () => {
    dismissNudge();
    setOpen((v) => !v);
  };

  /** Only the newest bot turn offers suggestions — older ones would stack up. */
  const lastBot = [...messages].reverse().find((m) => m.from === "bot");
  const suggestions =
    lastBot?.from === "bot" ? (lastBot.reply.suggestions ?? []) : [];

  /*
   * The offer being completed, and the tail of it that is drawn behind the
   * caret.
   *
   * Empty field → the first offer, so there is always something on the table.
   * Once typing starts it becomes a prefix match, which is what makes this
   * worth having over the chip row: three characters of "ser" reaches "Service
   * centres" without a click. A match that is already complete offers nothing,
   * so the ghost disappears rather than sitting there as a duplicate.
   */
  const match = value.trim()
    ? suggestions.find(
        (s) =>
          s.label.toLowerCase().startsWith(value.toLowerCase()) &&
          s.label.length > value.length,
      )
    : suggestions[0];

  const ghost = match ? match.label.slice(value.length) : "";

  const acceptGhost = useCallback(() => {
    if (!match) return;
    setValue(match.label);
    // Remembered so the submit runs the intent itself rather than putting the
    // label back through the matcher. The chips carried their intent for the
    // same reason: an intent cannot misfire, a string can.
    acceptedIntent.current = match.intent;
    inputRef.current?.focus();
  }, [match]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!ghost) return;

    /*
     * Tab is the accept key, and it is only intercepted while a completion is
     * actually showing — otherwise it does what Tab is supposed to do and moves
     * to the send button. Right arrow at the end of the line accepts too, which
     * is the shell convention, and Escape dismisses without leaving the field.
     */
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      acceptGhost();
      return;
    }

    if (
      e.key === "ArrowRight" &&
      e.currentTarget.selectionStart === value.length
    ) {
      e.preventDefault();
      acceptGhost();
      return;
    }

    if (e.key === "Escape") {
      // Swallowed so the panel stays open: dismissing the suggestion and
      // closing the whole assistant should not be the same keystroke.
      e.stopPropagation();
      setValue((v) => (v === "" ? " " : v).trimEnd());
      acceptedIntent.current = null;
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    const intent = acceptedIntent.current;
    if (intent && trimmed === value.trim()) {
      setMessages((m) => [
        ...m,
        { id: nextId++, from: "user", text: trimmed },
      ]);
      respond(answerIntent(intent));
    } else {
      send(trimmed);
    }

    setValue("");
    acceptedIntent.current = null;
  };

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
          {/*
            Ruled texture under the bar, at 12% of the header's own ink so it
            inverts with the theme. Same Magic UI grid the service bands use —
            it is the site's texture vocabulary, and it gives the header a
            surface instead of a flat fill.
          */}
          <span className="chat-panel__head-grid" aria-hidden="true">
            <GridPattern size={22} />
          </span>

          <span className="chat-panel__avatar" aria-hidden="true">
            <Headset size={18} strokeWidth={1.75} />
          </span>

          <span className="chat-panel__id">
            <span className="chat-panel__eyebrow">Support assistant</span>
            <strong>{company.name}</strong>
            <span className="chat-panel__status">
              <span className="chat-panel__live" aria-hidden="true" />
              Answers instantly · human hand-off any time
            </span>
          </span>

          {/*
            Replaces the close button rather than simply dropping it. The
            launcher below is still the close control — it turns into an ✕
            while the panel is open — and Escape has always worked; this makes
            the keyboard route discoverable now that there is no button to
            reach for.

            Pointer devices only. On a touch screen there is no Esc key to
            press and the launcher sits directly under your thumb, so the hint
            would be a lie taking up space.
          */}
          <kbd className="chat-panel__esc">Esc</kbd>
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
              /*
                Avatar outside the bubble, in the gutter — the one idea worth
                taking from 21st.dev's chat components. It gives the assistant
                a fixed left edge to speak from, so a run of bot turns reads as
                one voice rather than as a stack of unattributed boxes. Drawn
                as the site's bordered glyph, not their rounded avatar.
              */
              <div key={message.id} className="chat-turn">
                <span className="chat-turn__avatar" aria-hidden="true">
                  <Headset size={14} strokeWidth={1.75} />
                </span>
                <div className="chat-msg chat-msg--bot">
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
                          <a
                            key={link.href}
                            href={link.href}
                            className="chat-link"
                          >
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
              </div>
            ),
          )}

          {typing && (
            <div className="chat-turn">
              <span className="chat-turn__avatar" aria-hidden="true">
                <Headset size={14} strokeWidth={1.75} />
              </span>
              <p className="chat-msg chat-msg--bot chat-typing">
                <span className="sr-only">Typing</span>
                <span className="chat-typing__dot" aria-hidden="true" />
                <span className="chat-typing__dot" aria-hidden="true" />
                <span className="chat-typing__dot" aria-hidden="true" />
              </p>
            </div>
          )}
        </div>

        {/*
          The suggestions used to be a row of chips above this form. They are
          now completed inside the field itself: the rest of the offer is drawn
          in grey behind the caret and Tab takes it. That returns the chip row's
          height to the conversation, which is the part of the panel worth
          having.
        */}
        <form className="chat-form" onSubmit={onSubmit}>
          <label htmlFor={`${panelId}-input`} className="sr-only">
            Your message
          </label>

          <div className="chat-field">
            {/*
              The ghost is a separate layer under the input, not the input's
              own value — the field has to keep exactly what was typed, or
              submitting would send a half-accepted suggestion. It mirrors the
              typed text in an invisible span so the completion starts at the
              caret whatever has been entered, rather than at a guessed offset.
            */}
            {ghost && (
              <div className="chat-ghost" aria-hidden="true">
                <span className="chat-ghost__typed">{value}</span>
                <span className="chat-ghost__rest">{ghost}</span>
              </div>
            )}

            <input
              ref={inputRef}
              id={`${panelId}-input`}
              name="message"
              type="text"
              autoComplete="off"
              maxLength={400}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                acceptedIntent.current = null;
              }}
              onKeyDown={onKeyDown}
              /*
                No placeholder while a completion is showing.

                An empty field paints both: the browser draws the placeholder
                and the ghost layer draws the suggestion, in the same box, on
                top of each other. Only one of them can be taken with Tab, so
                the suggestion is the one that stays. The placeholder returns
                whenever there is no completion to offer — after an answer that
                carries no suggestions, which is when a prompt is actually
                useful again.
              */
              placeholder={
                ghost ? undefined : "Ask about services, coverage, SLA…"
              }
              className="chat-form__input"
              /*
                `inline` is the honest value: the completion appears in the
                field rather than in a popup listbox, so there is no list to
                own with `aria-activedescendant`.
              */
              aria-autocomplete="inline"
              aria-describedby={ghost ? `${panelId}-ghost` : undefined}
            />

            {/*
              What the ghost says, for anyone who cannot see it. Polite, so it
              waits for a pause in typing instead of interrupting every
              keystroke.
            */}
            <span id={`${panelId}-ghost`} className="sr-only" aria-live="polite">
              {ghost ? `Suggestion: ${value}${ghost}. Press Tab to accept.` : ""}
            </span>
          </div>

          {/* Pointer users get no Tab key, so they get the affordance instead. */}
          {ghost && (
            <button
              type="button"
              className="chat-field__accept"
              onClick={acceptGhost}
              tabIndex={-1}
              aria-hidden="true"
            >
              Tab
            </button>
          )}

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

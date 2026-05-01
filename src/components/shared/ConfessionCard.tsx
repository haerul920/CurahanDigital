"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, X, Expand } from "lucide-react";

interface ConfessionCardProps {
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  username?: string;
  avatarSeed?: string;
}

const CLAMP_CHARS = 90;

function Avatar({
  isAnonymous,
  avatarSeed,
  displayName,
  size = "sm",
}: {
  isAnonymous: boolean;
  avatarSeed?: string;
  displayName: string;
  size?: "sm" | "lg";
}) {
  const cls =
    size === "lg"
      ? "w-10 h-10 text-base"
      : "w-7 h-7 text-xs";

  return (
    <div
      className={`${cls} shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 overflow-hidden`}
    >
      {isAnonymous ? (
        "?"
      ) : avatarSeed ? (
        <img
          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}`}
          className="w-full h-full object-cover"
          alt="avatar"
        />
      ) : (
        displayName[0]?.toUpperCase() || "U"
      )}
    </div>
  );
}

// ── Full-content modal ────────────────────────────────────────────────────────
function PostModal({
  content,
  displayName,
  timestamp,
  likes,
  comments,
  isAnonymous,
  avatarSeed,
  onClose,
}: ConfessionCardProps & { displayName: string; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal-card"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
        >
          {/* Accent */}
          <div className="h-0.5 w-full bg-linear-to-r from-emerald-400/80 via-teal-400/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Avatar
                isAnonymous={isAnonymous}
                avatarSeed={avatarSeed}
                displayName={displayName}
                size="lg"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                  {displayName}
                </span>
                {isAnonymous && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    anonymous
                  </span>
                )}
              </div>
              <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">
                {timestamp}
              </span>
            </div>

            {/* Full content */}
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-1">
              {content}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-medium tabular-nums">{likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium tabular-nums">{comments}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── Card (1:1 square) ─────────────────────────────────────────────────────────
export default function ConfessionCard(props: ConfessionCardProps) {
  const { content, timestamp, likes, comments, isAnonymous, username, avatarSeed } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const displayName = isAnonymous ? "Anonymous" : username || "User";
  const isLong = content.length > CLAMP_CHARS;
  const preview = isLong ? content.slice(0, CLAMP_CHARS).trimEnd() + "…" : content;

  return (
    <>
      {/* ── Square card ── */}
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.09)" }}
        transition={{ duration: 0.18 }}
        className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700 overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Accent line */}
        <div className="h-0.5 w-full bg-linear-to-r from-emerald-400/70 via-teal-400/40 to-transparent" />

        {/* Inner layout — fills the square */}
        <div className="absolute inset-0 top-0.5 flex flex-col p-4 gap-2">
          {/* Header */}
          <div className="flex items-center gap-2 shrink-0">
            <Avatar
              isAnonymous={isAnonymous}
              avatarSeed={avatarSeed}
              displayName={displayName}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                {displayName}
              </span>
              {isAnonymous && (
                <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 leading-tight">
                  anonymous
                </span>
              )}
            </div>
            <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              {timestamp}
            </span>
          </div>

          {/* Content — fills remaining space, no scroll */}
          <div className="flex-1 overflow-hidden">
            <p className="text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-4">
              {content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between shrink-0 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors group/btn">
                <Heart className="w-3 h-3 transition-transform group-hover/btn:scale-110" />
                <span className="text-[11px] font-medium tabular-nums">{likes}</span>
              </button>
              <button className="flex items-center gap-1 text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors group/btn">
                <MessageCircle className="w-3 h-3 transition-transform group-hover/btn:scale-110" />
                <span className="text-[11px] font-medium tabular-nums">{comments}</span>
              </button>
            </div>

            {/* Read more button — only when content is clipped */}
            {isLong && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                <Expand className="w-3 h-3" />
                Baca
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Modal ── */}
      {modalOpen && (
        <PostModal
          {...props}
          displayName={displayName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

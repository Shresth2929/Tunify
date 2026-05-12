/**
 * FloatingNotes — high-density full-page scattered music icon background
 * Scattered across the entire page height so they're always visible everywhere.
 */

const SYMBOLS = ['♪', '♫', '♩', '♬', '𝄞', '𝄢', '♭', '♯'];

// Generate ~120 notes spread across the full page (top 0%–100%, left 0%–100%)
const generateNotes = () => {
  const notes = [];
  const count = 120;
  for (let i = 0; i < count; i++) {
    notes.push({
      s: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      t: `${Math.random() * 100}%`,
      l: `${Math.random() * 100}%`,
      dur: 5 + Math.random() * 10,
      delay: Math.random() * -10, // Negative delay to start mid-animation
      size: `${0.7 + Math.random() * 1.3}rem`,
      rot: Math.random() * 360 - 180,
    });
  }
  return notes;
};

const NOTES = generateNotes();

export default function FloatingNotes() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ minHeight: '100%' }}
      aria-hidden="true"
    >
      {NOTES.map((n, i) => (
        <span
          key={i}
          className="music-note"
          style={{
            position: 'absolute',
            top: n.t,
            left: n.l,
            fontSize: n.size,
            color: 'rgba(249,115,22,0.15)', // Increased opacity for better visibility
            transform: `rotate(${n.rot}deg)`,
            animationDuration: `${n.dur}s`,
            animationDelay: `${n.delay}s`,
          }}
        >
          {n.s}
        </span>
      ))}
    </div>
  );
}

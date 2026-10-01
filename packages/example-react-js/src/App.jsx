import { class$, style$, var$ } from "vinocss"

const theme = var$({ surface: "", ink: "" })

const card = class$({
  padding: "1.5rem",
  color: theme.ink,
  background: theme.surface,
  borderRadius: "0.75rem",
  boxShadow: ["0 1px 3px rgb(0 0 0 / 0.2)", "0 4px 12px rgb(0 0 0 / 0.15)"],
  ":hover": { boxShadow: "0 6px 20px rgb(0 0 0 / 0.25)" },
  "@media (prefers-color-scheme: dark)": { background: "#1c1c22", color: "#f4f4f5" },
})

style$({
  ":root": { [theme.surface]: "#ffffff", [theme.ink]: "#18181b" },
  body: {
    margin: "0",
    fontFamily: "system-ui, sans-serif",
    display: "grid",
    placeItems: "center",
  },
})

export function App() {
  return (
    <main className={card}>
      <h1>VinoCSS + React</h1>
      <p>Every style here comes from a vinocss call.</p>
      <button
        className={class$({
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          color: theme.surface,
          background: theme.ink,
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        })}
      >
        Press
      </button>
    </main>
  )
}

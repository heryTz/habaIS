import { useState, useEffect } from 'react'
import { calculerIS, type ISInput } from './lib/is'
import './app.css'

const EXAMPLE: Record<string, string> = {
  CA: '40000000',
  charges_eligibles: '1950000',
  acomptes_payes: '700000',
  minimum_perception: '1200000',
  acompte_N: '',
}

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

function parseNum(s: string): number | undefined {
  const n = parseFloat(s.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? undefined : n
}

type Fields = typeof EXAMPLE

function parseInput(v: Fields): ISInput | null {
  const CA = parseNum(v.CA)
  const charges_eligibles = parseNum(v.charges_eligibles)
  const acomptes_payes = parseNum(v.acomptes_payes)
  const minimum_perception = parseNum(v.minimum_perception)
  if (CA === undefined || charges_eligibles === undefined || acomptes_payes === undefined || minimum_perception === undefined)
    return null
  const acompte_N = v.acompte_N.trim() ? parseNum(v.acompte_N) : undefined
  if (v.acompte_N.trim() && acompte_N === undefined) return null
  return { CA, charges_eligibles, acomptes_payes, minimum_perception, acompte_N }
}

type FieldDef = { key: keyof Fields; label: string; hint: string; optional?: boolean }

const FIELDS: FieldDef[] = [
  { key: 'CA', label: "Chiffre d'affaires", hint: 'CA annuel brut en Ariary' },
  { key: 'charges_eligibles', label: 'Charges éligibles', hint: 'Charges déductibles (réduction de 2 %)' },
  { key: 'acomptes_payes', label: 'Acomptes payés', hint: 'Versements IS déjà effectués' },
  { key: 'minimum_perception', label: 'Minimum légal', hint: 'Seuil min. (ex : 16 000 Ar ou 3 % du CA)' },
  { key: 'acompte_N', label: 'Acompte N', hint: 'Vide → 5 % du CA arrondi', optional: true },
]

type RowProps = {
  label: string
  formula?: string
  value: number
  color?: 'default' | 'dim' | 'green' | 'amber' | 'total'
  indent?: boolean
}

function Row({ label, formula, value, color = 'default', indent }: RowProps) {
  const valueColor = {
    default: 'text-zinc-900',
    dim: 'text-zinc-500',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    total: 'text-amber-500',
  }[color]

  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${indent ? 'pl-4 border-l border-zinc-300' : ''}`}>
      <div className="min-w-0">
        <span className="text-sm text-zinc-700">{label}</span>
        {formula && (
          <span
            className="ml-2 text-xs text-zinc-500 font-['IBM_Plex_Mono']"
          >
            {formula}
          </span>
        )}
      </div>
      <span
        className={`shrink-0 text-sm font-semibold font-['IBM_Plex_Mono'] tabular-nums ${valueColor}`}
      >
        {fmt(value)} Ar
      </span>
    </div>
  )
}

function BlockCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 px-4 py-3">
      <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mb-2">
        {title}
      </div>
      <div className="divide-y divide-zinc-100">{children}</div>
    </div>
  )
}

const LS_KEY = 'haba_is_fields'

export default function App() {
  const [values, setValues] = useState<Fields>(EXAMPLE)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setValues({ ...EXAMPLE, ...JSON.parse(stored) })
    } catch {
      // ignore malformed localStorage data
    }
  }, [])

  const input = parseInput(values)
  const result = input ? calculerIS(input) : null
  const minimumApplied = result ? result.IS_minimum > result.IS_apres_charges : false

  function handleChange(key: keyof Fields, val: string) {
    setValues(prev => {
      const next = { ...prev, [key]: val }
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 px-4 py-10 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 mb-1">
            République de Madagascar — {new Date().getFullYear()}
          </p>
          <h1 className="text-4xl font-bold text-zinc-900 leading-tight">
            Haba <em className="not-italic text-amber-400">IS</em>
          </h1>
          <p className="mt-1 text-zinc-500 text-sm">
            Impôt Synthétique — détail complet du calcul
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* ── FORM PANEL ─────────────────────────── */}
          <div className="rounded-2xl bg-white border border-zinc-200 p-6 space-y-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
              Paramètres
            </h2>

            {FIELDS.map(f => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={f.key} className="text-sm font-medium text-zinc-700">
                    {f.label}
                  </label>
                  {f.optional && (
                    <span className="text-[10px] tracking-wide uppercase text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                      optionnel
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id={f.key}
                    type="text"
                    inputMode="numeric"
                    placeholder={f.optional ? 'auto' : '0'}
                    value={values[f.key]}
                    onChange={e => handleChange(f.key, e.target.value)}
                    autoComplete="off"
                    className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm font-['IBM_Plex_Mono'] rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder:text-zinc-400 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-['IBM_Plex_Mono'] pointer-events-none">
                    Ar
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{f.hint}</p>
              </div>
            ))}
          </div>

          {/* ── RESULTS PANEL ──────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
              Détail du calcul
            </h2>

            {!result ? (
              <div className="rounded-2xl bg-white border border-zinc-200 p-8 text-center text-zinc-400 text-sm">
                Renseignez les paramètres pour voir le calcul.
              </div>
            ) : (
              <>
                {/* Base imposable */}
                <BlockCard title="Base imposable">
                  <Row label="CA brut" value={input!.CA} color="dim" />
                  <Row
                    label="CA arrondi"
                    formula="⌊ CA / 10 000 ⌋ × 10 000"
                    value={result.CA_arrondi}
                    indent
                  />
                </BlockCard>

                {/* IS brut */}
                <BlockCard title="IS brut">
                  <Row
                    label="IS brut"
                    formula="CA arrondi × 5 %"
                    value={result.IS_brut}
                    color="amber"
                  />
                </BlockCard>

                {/* Réduction */}
                <BlockCard title="Réduction pour charges éligibles">
                  <Row label="Charges éligibles" value={input!.charges_eligibles} color="dim" />
                  <Row
                    label="Réduction"
                    formula="charges × 2 %"
                    value={result.reduction}
                    color="green"
                    indent
                  />
                  <Row
                    label="IS après charges"
                    formula="IS brut − réduction"
                    value={result.IS_apres_charges}
                    indent
                  />
                </BlockCard>

                {/* Minimum légal */}
                <BlockCard title="Minimum légal">
                  <Row label="IS après charges" value={result.IS_apres_charges} color="dim" />
                  <Row label="Minimum légal fixé" value={input!.minimum_perception} color="dim" />
                  <Row
                    label="IS minimum"
                    formula={minimumApplied ? 'max → minimum appliqué' : 'max → IS après charges retenu'}
                    value={result.IS_minimum}
                    color={minimumApplied ? 'amber' : 'default'}
                    indent
                  />
                </BlockCard>

                {/* Acomptes */}
                <BlockCard title="Déduction des acomptes">
                  <Row
                    label="Acomptes déjà payés"
                    value={input!.acomptes_payes}
                    color="green"
                  />
                  <Row
                    label="IS solde"
                    formula="max(0, IS minimum − acomptes)"
                    value={result.IS_solde}
                    color="amber"
                    indent
                  />
                </BlockCard>

                {/* Acompte N */}
                <BlockCard title="Provision année N">
                  <Row
                    label="Acompte N"
                    formula={input!.acompte_N !== undefined ? 'valeur personnalisée' : 'CA arrondi × 5 %'}
                    value={result.acompte_N}
                    color="amber"
                  />
                </BlockCard>

                {/* Total */}
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 px-5 py-4">
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-amber-600 mb-3">
                    Total à payer
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-700">IS solde + Acompte N</p>
                      <p className="text-xs text-zinc-500 font-['IBM_Plex_Mono'] mt-0.5">
                        {fmt(result.IS_solde)} + {fmt(result.acompte_N)}
                      </p>
                    </div>
                    <span className="text-2xl font-bold font-['IBM_Plex_Mono'] tabular-nums text-amber-500">
                      {fmt(result.total_a_payer)} Ar
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-zinc-400">
        <a
          href="https://textes.lexxika.com/lois-malagasy/code-des-impots-2025-4/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 underline underline-offset-2 hover:text-zinc-300 transition-colors"
        >
          Code des impôts 2025
        </a>
        {' '}—{' '}
        Créé avec ❤️ par{' '}
        <a
          href="https://www.linkedin.com/in/hery-nirintsoa-0813b91a4/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-500 underline underline-offset-2 hover:text-amber-400 transition-colors"
        >
          Hery Nirintsoa
        </a>{' '}
        — {new Date().getFullYear()}
      </footer>
    </div>
  )
}

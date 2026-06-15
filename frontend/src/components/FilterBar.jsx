import { Filter, RotateCcw } from "lucide-react";

function FilterSelect({ label, value, onChange, options, allLabel }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="tiny-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 rounded-lg border border-white/10 bg-ink-800 px-3 text-xs font-semibold text-stone-100 outline-none transition hover:border-flame-400/45 focus:border-flame-400"
      >
        <option value={allLabel}>{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ filters, setFilters, options }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const reset = () =>
    setFilters({
      company: "Todas",
      role: "Todos",
      workerType: "Todos",
      contract: "Todos",
    });

  return (
    <section className="panel p-3">
      <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
        <div className="flex items-center gap-2 pb-1">
          <Filter size={15} className="text-flame-400" />
          <span className="tiny-label text-stone-200">Filtros</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Empresa"
            value={filters.company}
            onChange={(value) => update("company", value)}
            options={options.companies}
            allLabel="Todas"
          />
          <FilterSelect
            label="Cargo"
            value={filters.role}
            onChange={(value) => update("role", value)}
            options={options.roles}
            allLabel="Todos"
          />
          <FilterSelect
            label="Tipo trabajador"
            value={filters.workerType}
            onChange={(value) => update("workerType", value)}
            options={options.workerTypes}
            allLabel="Todos"
          />
          <FilterSelect
            label="Contrato"
            value={filters.contract}
            onChange={(value) => update("contract", value)}
            options={options.contracts}
            allLabel="Todos"
          />
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-xs font-bold text-stone-200 transition hover:border-flame-400/40 hover:bg-flame-500/10"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </section>
  );
}

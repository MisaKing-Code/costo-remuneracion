import { Filter, RotateCcw, Search } from "lucide-react";

function FilterSelect({ label, value, onChange, options = [], allLabel, allDisplayLabel = allLabel, disabled = false }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="tiny-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-9 min-w-0 rounded-lg border border-white/10 bg-ink-800 px-3 text-xs font-semibold text-stone-100 outline-none transition hover:border-flame-400/45 focus:border-flame-400 disabled:cursor-not-allowed disabled:border-flame-400/20 disabled:bg-flame-500/[0.08] disabled:text-flame-200"
      >
        {disabled && value !== allLabel ? <option value={value}>{value}</option> : null}
        <option value={allLabel}>{allDisplayLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActiveFilterChip({ label, value }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-flame-400/25 bg-flame-500/[0.10] px-2.5 py-1 text-[11px] font-bold text-stone-200">
      <span className="shrink-0 text-flame-300">{label}:</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

export default function FilterBar({ filters, setFilters, options, lockedCompany = "Todas" }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const defaultPeriod = options.periods?.[0] || "Todos";
  const isCompanyLocked = lockedCompany !== "Todas";
  const searchTerm = String(filters.searchTerm || "").trim();
  const activeChips = [
    filters.period !== "Todos" ? { label: "Periodo", value: filters.period } : null,
    isCompanyLocked
      ? { label: "Sociedad", value: lockedCompany }
      : filters.company !== "Todas"
        ? { label: "Empresa", value: filters.company }
        : null,
    filters.businessCenter !== "Todos" ? { label: "Centro", value: filters.businessCenter } : null,
    filters.workerType !== "Todos" ? { label: "Tipo trabajador", value: filters.workerType } : null,
    filters.contract !== "Todos" ? { label: "Contrato", value: filters.contract } : null,
    searchTerm ? { label: "Buscar", value: `"${searchTerm}"` } : null,
  ].filter(Boolean);
  const reset = () =>
    setFilters({
      period: defaultPeriod,
      company: isCompanyLocked ? lockedCompany : "Todas",
      businessCenter: "Todos",
      workerType: "Todos",
      contract: "Todos",
      searchTerm: "",
    });

  return (
    <section className="panel p-3">
      <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
        <div className="flex items-center gap-2 pb-1">
          <Filter size={15} className="text-flame-400" />
          <span className="tiny-label text-stone-200">Filtros</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <FilterSelect
            label="Periodo"
            value={filters.period}
            onChange={(value) => update("period", value)}
            options={options.periods}
            allLabel="Todos"
            allDisplayLabel="Todos los periodos"
          />
          <FilterSelect
            label={isCompanyLocked ? "Sociedad seleccionada" : "Empresa"}
            value={isCompanyLocked ? lockedCompany : filters.company}
            onChange={(value) => update("company", value)}
            options={isCompanyLocked ? [] : options.companies}
            allLabel="Todas"
            disabled={isCompanyLocked}
          />
          <FilterSelect
            label="Centro de Negocio"
            value={filters.businessCenter}
            onChange={(value) => update("businessCenter", value)}
            options={options.businessCenters}
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
            label="Tipo Contrato"
            value={filters.contract}
            onChange={(value) => update("contract", value)}
            options={options.contracts}
            allLabel="Todos"
          />
        </div>
        <label className="flex min-w-0 flex-col gap-1 lg:col-start-2">
          <span className="tiny-label">Buscar trabajador</span>
          <span className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-ink-800 px-3 transition hover:border-flame-400/45 focus-within:border-flame-400">
            <Search size={14} className="shrink-0 text-flame-400" />
            <input
              type="search"
              value={filters.searchTerm || ""}
              onChange={(event) => update("searchTerm", event.target.value)}
              placeholder="Nombre, RUT o cargo"
              className="h-full min-w-0 flex-1 bg-transparent text-xs font-semibold text-stone-100 outline-none placeholder:text-stone-500"
            />
          </span>
        </label>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-xs font-bold text-stone-200 transition hover:border-flame-400/40 hover:bg-flame-500/10"
        >
          <RotateCcw size={14} />
          Restablecer
        </button>
        {activeChips.length ? (
          <div className="flex min-w-0 flex-wrap gap-2 lg:col-start-2">
            {activeChips.map((chip) => (
              <ActiveFilterChip key={`${chip.label}-${chip.value}`} label={chip.label} value={chip.value} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

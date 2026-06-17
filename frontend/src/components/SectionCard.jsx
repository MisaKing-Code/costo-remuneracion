export default function SectionCard({ title, subtitle, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`panel p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon ? <Icon size={14} className="text-flame-500" strokeWidth={2.4} /> : null}
          <div>
            <h2 className="tiny-label text-stone-200">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs font-semibold text-stone-500">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

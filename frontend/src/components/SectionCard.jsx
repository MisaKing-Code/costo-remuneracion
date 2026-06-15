export default function SectionCard({ title, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`panel p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon ? <Icon size={14} className="text-flame-500" strokeWidth={2.4} /> : null}
          <h2 className="tiny-label text-stone-200">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function DashboardShell({ sidebar, children }) {
  if (!sidebar) {
    return (
      <main className="min-h-screen px-3 py-3 text-stone-100 sm:px-5 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4">{children}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-3 text-stone-100 sm:px-5 lg:px-6">
      <div className="mx-auto grid w-full max-w-[1600px] gap-4 lg:grid-cols-[324px_minmax(0,1fr)]">
        {sidebar ? <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">{sidebar}</div> : null}
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}

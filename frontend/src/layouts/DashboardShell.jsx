export default function DashboardShell({ children }) {
  return (
    <main className="min-h-screen px-3 py-3 text-stone-100 sm:px-5 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4">{children}</div>
    </main>
  );
}

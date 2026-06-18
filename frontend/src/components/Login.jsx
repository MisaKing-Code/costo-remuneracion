import { AlertCircle, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";

const VALID_USER = "Admin";
const VALID_PASSWORD = "SanLuis2026";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (username.trim() === VALID_USER && password === VALID_PASSWORD) {
      setError("");
      onLogin();
      return;
    }

    setError("Credenciales incorrectas. Verifica usuario y contraseña.");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 text-stone-50">
      <img
        src="/bus-psl.jpg"
        alt="Bus Pullman San Luis"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/58" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/28 to-black/52" />
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute right-[10%] top-[18%] h-60 w-60 rounded-full bg-flame-500/22 blur-3xl" />

      <section className="relative z-10 grid min-h-screen items-center gap-8 px-5 py-8 md:grid-cols-[1fr_430px] md:px-10 lg:px-16">
        <div className="hidden max-w-xl md:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-flame-300/35 bg-flame-500/[0.16] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-flame-200 shadow-[0_12px_34px_rgba(0,0,0,.28)]">
            <ShieldCheck size={14} />
            Acceso corporativo
          </div>
          <h1 className="text-[52px] font-black leading-[0.95] tracking-normal text-white drop-shadow-[0_16px_38px_rgba(0,0,0,.75)] lg:text-[64px]">
            Bienvenido
          </h1>
          <p className="mt-5 max-w-md text-[15px] font-bold leading-7 text-stone-100 drop-shadow-[0_8px_24px_rgba(0,0,0,.85)]">
            Plataforma ejecutiva para monitorear costo remuneracional, dotación y composición financiera corporativa.
          </p>
          <div className="mt-8 h-px w-80 bg-gradient-to-r from-flame-300 via-white/35 to-transparent" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[430px] rounded-lg border border-white/18 bg-[#161712]/94 p-5 shadow-[0_34px_95px_rgba(0,0,0,.72),inset_0_1px_0_rgba(255,255,255,.10)] backdrop-blur-2xl sm:p-6"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-5 rounded-lg border border-white/14 bg-white/[0.07] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_18px_42px_rgba(0,0,0,.24)]">
              <img src="/logo-psl.png" alt="Pullman San Luis" className="h-16 w-auto object-contain" />
            </div>
            <p className="tiny-label text-flame-200">Dashboard Ejecutivo</p>
            <h2 className="mt-1 text-3xl font-black tracking-normal text-white">Bienvenido</h2>
            <p className="mt-1 text-sm font-bold text-stone-200">Dashboard Corporativo de Remuneraciones</p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-200">Usuario</span>
              <div className="mt-1.5 flex h-11 items-center gap-2 rounded-md border border-white/14 bg-black/38 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] transition focus-within:border-flame-300/80">
                <UserRound size={16} className="text-flame-300" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-stone-400"
                  placeholder="Ingrese usuario"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-200">Contraseña</span>
              <div className="mt-1.5 flex h-11 items-center gap-2 rounded-md border border-white/14 bg-black/38 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] transition focus-within:border-flame-300/80">
                <LockKeyhole size={16} className="text-flame-300" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-stone-400"
                  placeholder="Ingrese contraseña"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-stone-300 transition hover:bg-white/[0.08] hover:text-flame-200"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-red-300/25 bg-red-500/14 px-3 py-2 text-xs font-bold text-red-100">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-5 h-11 w-full rounded-md bg-gradient-to-r from-flame-500 to-flame-300 text-sm font-black uppercase tracking-[0.08em] text-ink-950 shadow-[0_18px_38px_rgba(255,123,85,.30)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(255,123,85,.40)]"
          >
            Ingresar
          </button>

          <p className="mt-4 text-center text-[11px] font-bold leading-5 text-stone-300">
            Protección visual básica para presentación interna. No reemplaza autenticación segura definitiva.
          </p>
        </form>
      </section>
    </main>
  );
}

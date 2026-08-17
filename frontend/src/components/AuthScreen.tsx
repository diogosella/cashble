import { FormEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type AuthMode = "login" | "signup";

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isSupabaseConfigured) {
      setError("Configure REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
          throw authError;
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (authError) {
          throw authError;
        }

        if (!data.session) {
          setMessage("Cadastro criado. Confirme o e-mail antes de entrar.");
        }
      }
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Nao foi possivel autenticar");
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-[1100px] place-items-center p-4 md:p-8">
      <section className="grid w-full overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden min-h-[620px] flex-col justify-between bg-[#33364f] p-10 lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-positive">Cashble</p>
            <h1 className="mt-6 max-w-lg text-5xl font-semibold leading-tight text-strong">
              Suas financas, separadas e protegidas.
            </h1>
            <p className="mt-6 max-w-md leading-7 text-muted">
              Cada conta possui dados financeiros exclusivos, sincronizados entre computador e celular.
            </p>
          </div>
          <p className="text-sm text-muted">Autenticacao segura e isolamento de dados pelo Supabase.</p>
        </div>

        <div className="flex min-h-[620px] items-center p-6 md:p-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm uppercase tracking-[0.22em] text-positive lg:hidden">Cashble</p>
            <h2 className="mt-3 text-3xl font-semibold text-strong">
              {mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {mode === "login"
                ? "Acesse suas caixas, movimentacoes e automacoes."
                : "Seus dados comecam vazios e ficam separados dos demais usuarios."}
            </p>

            {!isSupabaseConfigured ? (
              <p className="mt-6 border border-[#d8a2a2]/40 bg-[#3a2d3d] p-3 text-sm text-negative">
                Supabase Auth ainda nao esta configurado neste ambiente.
              </p>
            ) : null}

            {error ? (
              <p className="mt-6 border border-[#d8a2a2]/40 bg-[#3a2d3d] p-3 text-sm text-negative">{error}</p>
            ) : null}

            {message ? (
              <p className="mt-6 border border-[var(--line-strong)] bg-[#2f4650] p-3 text-sm text-positive">{message}</p>
            ) : null}

            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-medium" htmlFor="auth-email">
                E-mail
                <input
                  autoComplete="email"
                  className="control"
                  id="auth-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium" htmlFor="auth-password">
                Senha
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="control"
                  id="auth-password"
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimo de 6 caracteres"
                  required
                  type="password"
                  value={password}
                />
              </label>

              <button className="btn-primary mt-2 h-11" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <button
              className="btn-quiet mt-5 w-full"
              onClick={() => changeMode(mode === "login" ? "signup" : "login")}
              type="button"
            >
              {mode === "login" ? "Ainda nao tenho uma conta" : "Ja tenho uma conta"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

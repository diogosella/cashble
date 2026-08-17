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
    <main className="min-h-dvh w-full">
      <section className="grid min-h-dvh w-full bg-[var(--surface)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden min-h-dvh items-center p-12 lg:flex xl:p-16">
          <h1 className="max-w-2xl text-6xl font-semibold leading-tight text-strong xl:text-7xl">
            Suas financas, separadas e protegidas.
          </h1>
        </div>

        <div className="flex min-h-dvh items-center p-8 md:p-12 xl:p-16">
          <div className="mx-auto w-full max-w-lg">
            <p className="text-base uppercase tracking-[0.22em] text-positive lg:hidden">Cashble</p>
            <h2 className="mt-3 text-4xl font-semibold text-strong md:text-5xl">
              {mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              {mode === "login"
                ? "Acesse suas caixas, movimentacoes e automacoes."
                : "Seus dados comecam vazios e ficam separados dos demais usuarios."}
            </p>

            {!isSupabaseConfigured ? (
              <p className="mt-6 border border-[#d8a2a2] bg-[#3a2d3d] p-4 text-base text-negative">
                Supabase Auth ainda nao esta configurado neste ambiente.
              </p>
            ) : null}

            {error ? (
              <p className="mt-6 border border-[#d8a2a2] bg-[#3a2d3d] p-4 text-base text-negative">{error}</p>
            ) : null}

            {message ? (
              <p className="mt-6 border border-[var(--line-strong)] bg-[#2f4650] p-4 text-base text-positive">{message}</p>
            ) : null}

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-base font-medium" htmlFor="auth-email">
                E-mail
                <input
                  autoComplete="email"
                  className="control h-12 text-base"
                  id="auth-email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="grid gap-2 text-base font-medium" htmlFor="auth-password">
                Senha
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="control h-12 text-base"
                  id="auth-password"
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>

              <button className="btn-primary mt-2 h-12 text-base" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <button
              className="btn-quiet mt-5 w-full text-base"
              onClick={() => changeMode(mode === "login" ? "signup" : "login")}
              type="button"
            >
              {mode === "login" ? "Criar conta" : "Ja tenho uma conta"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

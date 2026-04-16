"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase-client"

const MAX_ATTEMPTS = 5
const COOLDOWN_SECONDS = 30

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  const isBlocked = cooldownUntil !== null && Date.now() < cooldownUntil
  const remainingSeconds = isBlocked ? Math.ceil((cooldownUntil! - Date.now()) / 1000) : 0

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (isBlocked) {
      setError(`Muitas tentativas. Aguarde ${remainingSeconds} segundos.`)
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        setCooldownUntil(Date.now() + COOLDOWN_SECONDS * 1000)
        setAttempts(0)
        setError(`Muitas tentativas seguidas. Aguarde ${COOLDOWN_SECONDS} segundos antes de tentar novamente.`)
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts
        setError(`Email ou senha inválidos. ${remaining} tentativa${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`)
      }

      setIsLoading(false)
      return
    }

    router.push("/dashboard")
  }, [email, password, attempts, isBlocked, remainingSeconds, router])

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Royal Blue gradient */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0a1628 0%, #0d2b5e 40%, #1a3a7a 70%, #0d2b5e 100%)",
        }}
      >
        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Soft radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(26, 58, 122, 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Right Panel — White form area */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[#f5f5f5] px-6 py-12 relative">
        <div className="w-full max-w-md">
          {/* Caterpillar Logo */}
          <div className="mb-10 flex justify-center">
            <Image
              src="/caterpillar-logo.svg"
              alt="Caterpillar"
              width={240}
              height={100}
              className="h-auto w-60"
              priority
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="mt-1.5 text-sm text-[#888888]">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#333333]"
              >
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                disabled={isBlocked}
                className="w-full rounded-xl border border-[#e0e0e0] bg-[#eef1f6] px-4 py-3.5 text-sm text-[#1a1a1a] placeholder:text-[#aaaaaa] transition-all duration-200 outline-none focus:border-[#1a3a7a] focus:ring-2 focus:ring-[#1a3a7a]/15 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-[#333333]"
              >
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isBlocked}
                className="w-full rounded-xl border border-[#e0e0e0] bg-[#eef1f6] px-4 py-3.5 text-sm text-[#1a1a1a] placeholder:text-[#aaaaaa] transition-all duration-200 outline-none focus:border-[#1a3a7a] focus:ring-2 focus:ring-[#1a3a7a]/15 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isBlocked}
              className="group w-full rounded-full bg-[#0d2b5e] py-3.5 text-sm font-semibold text-white tracking-wide transition-all duration-300 hover:bg-[#1a3a7a] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : isBlocked ? (
                  `Aguarde ${remainingSeconds}s`
                ) : (
                  <>
                    Entrar
                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-[#aaaaaa] tracking-wide">
            © {new Date().getFullYear()} CATERPILLAR INC.&nbsp;&nbsp;&nbsp;MARTINELLI ADVOGADOS
          </p>
        </div>
      </div>
    </div>
  )
}

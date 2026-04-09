"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase-client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError("Email ou senha inválidos.")
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111111]">
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-[20%] top-0 h-full w-[60%] origin-top-left -skew-x-12 bg-gradient-to-b from-[#F6D000]/15 via-[#F6D000]/5 to-transparent"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(246,208,0,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(246,208,0,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#F6D000]/10 blur-[120px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]/90 p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-24 w-56 items-center justify-center">
              <Image
                src="/caterpillar-logo.svg"
                alt="Caterpillar"
                width={224}
                height={96}
                className="h-auto w-full brightness-0 invert"
                priority
              />
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-[#F6D000]/30 to-transparent" />

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#999999]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-lg border border-[#333333] bg-[#222222] px-4 py-3 text-sm text-white placeholder:text-[#555555] transition-all duration-200 outline-none focus:border-[#F6D000] focus:ring-2 focus:ring-[#F6D000]/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#999999]"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-[#333333] bg-[#222222] px-4 py-3 text-sm text-white placeholder:text-[#555555] transition-all duration-200 outline-none focus:border-[#F6D000] focus:ring-2 focus:ring-[#F6D000]/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-lg bg-[#F6D000] py-3 text-sm font-bold uppercase tracking-wider text-[#111111] transition-all duration-300 hover:bg-[#FFE033] hover:shadow-[0_0_30px_rgba(246,208,0,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
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
                ) : (
                  "Entrar"
                )}
              </span>
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-xs text-[#666666] transition-colors duration-200 hover:text-[#F6D000]"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-[#F6D000]/30 to-transparent" />

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-[#444444]">
          © {new Date().getFullYear()} Caterpillar Inc. · Martinelli Advogados
        </p>
        <div className="mt-3 flex justify-center">
          <Image
            src="/martinelli-logo.svg"
            alt="Martinelli Advogados"
            width={140}
            height={20}
            className="h-5 w-auto opacity-40"
          />
        </div>
      </div>
    </div>
  )
}

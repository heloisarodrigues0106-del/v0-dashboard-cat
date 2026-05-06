"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, Download, Share, Plus } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true
    setIsStandalone(standalone)

    if (standalone) return

    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) return
    }

    const ua = navigator.userAgent
    const iosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/i.test(ua)
    setIsIOS(iosDevice && isSafari)

    if (iosDevice && isSafari) {
      const timer = setTimeout(() => setShowPrompt(true), 1500)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 1500)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }, [])

  if (isStandalone || !showPrompt) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-6 z-[101] mx-auto max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500 md:inset-x-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2">
        <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl">
          {/* Yellow accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#F6D000] via-[#FFE033] to-[#F6D000]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-4 rounded-full p-1.5 text-[#666] transition-colors hover:bg-[#333] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6">
            {/* Logo */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F6D000]/10 p-2">
                <Image
                  src="/caterpillar-logo.svg"
                  alt="Labor Hub | Caterpillar"
                  width={40}
                  height={40}
                  className="h-auto w-full brightness-0 invert"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Labor Hub | Caterpillar</h2>
                <p className="text-xs text-[#888]">Instale para acesso rápido</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#ccc]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F6D000]" />
                Acesso direto da tela inicial
              </div>
              <div className="flex items-center gap-2 text-sm text-[#ccc]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F6D000]" />
                Experiência em tela cheia
              </div>
              <div className="flex items-center gap-2 text-sm text-[#ccc]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F6D000]" />
                Carregamento mais rápido
              </div>
            </div>

            {isIOS ? (
              /* iOS Instructions */
              <div className="space-y-3">
                <p className="text-sm font-medium text-white">
                  Para instalar no seu iPhone/iPad:
                </p>
                <div className="space-y-2.5 rounded-xl bg-[#222] p-4">
                  <div className="flex items-center gap-3 text-sm text-[#ccc]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#333] text-xs font-bold text-[#F6D000]">1</div>
                    <span>Toque no ícone <Share className="mb-0.5 inline h-4 w-4 text-[#007AFF]" /> na barra inferior</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#ccc]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#333] text-xs font-bold text-[#F6D000]">2</div>
                    <span>Role e toque em <Plus className="mb-0.5 inline h-4 w-4" /> <strong>&quot;Adicionar à Tela Inicial&quot;</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#ccc]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#333] text-xs font-bold text-[#F6D000]">3</div>
                    <span>Confirme tocando em <strong>&quot;Adicionar&quot;</strong></span>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full rounded-lg bg-[#333] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#444]"
                >
                  Entendi
                </button>
              </div>
            ) : (
              /* Android/Chrome Install */
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 rounded-lg bg-[#333] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#444]"
                >
                  Agora não
                </button>
                <button
                  onClick={handleInstall}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#F6D000] py-2.5 text-sm font-bold text-[#111] transition-all hover:bg-[#FFE033] hover:shadow-[0_0_20px_rgba(246,208,0,0.3)] active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

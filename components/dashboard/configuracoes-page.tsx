"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

function getPasswordStrength(password: string): { score: number; label: string; color: string; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push("mínimo 8 caracteres")
  if (!/[A-Z]/.test(password)) errors.push("uma letra maiúscula")
  if (!/[0-9]/.test(password)) errors.push("um número")
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("um caractere especial (@, #, !...)")

  const score = 4 - errors.length
  const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"]
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  return { score, label: labels[score], color: colors[score], errors }
}

export function ConfiguracoesPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [emailSaved, setEmailSaved] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

  const handleSaveEmail = async () => {
    setEmailError("")
    setIsLoadingEmail(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email })
      if (error) {
        setEmailError(error.message)
      } else {
        setEmailSaved(true)
        setTimeout(() => setEmailSaved(false), 2000)
      }
    } catch {
      setEmailError("Erro ao atualizar email. Tente novamente.")
    } finally {
      setIsLoadingEmail(false)
    }
  }

  const handleSavePassword = async () => {
    setPasswordError("")
    const strength = getPasswordStrength(newPassword)
    if (strength.score < 4) {
      setPasswordError(`A senha precisa ter: ${strength.errors.join(", ")}.`)
      return
    }
    if (!passwordsMatch) {
      setPasswordError("As senhas não coincidem.")
      return
    }
    if (!currentPassword) {
      setPasswordError("Informe a senha atual.")
      return
    }

    setIsLoadingPassword(true)
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || "Erro ao alterar senha.")
      } else {
        setPasswordSaved(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setPasswordSaved(false), 2000)
      }
    } catch {
      setPasswordError("Erro ao alterar senha. Tente novamente.")
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0
  const passwordStrength = newPassword.length > 0 ? getPasswordStrength(newPassword) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas informações de conta
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Alterar Email
            </CardTitle>
            <CardDescription>
              Atualize o endereço de email associado à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            {emailError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>
            )}
            <Button onClick={handleSaveEmail} className="w-full sm:w-auto" disabled={isLoadingEmail || !email}>
              {emailSaved ? (
                <><Check className="mr-2 h-4 w-4" />Salvo</>
              ) : isLoadingEmail ? "Salvando..." : "Salvar Email"}
            </Button>
          </CardContent>
        </Card>

        {/* Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-primary" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Atualize sua senha para manter sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Senha Atual */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="pr-10"
                  autoComplete="current-password"
                />
                <Button type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>

              {/* Barra de força da senha */}
              {passwordStrength && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 rounded-full transition-all ${i < passwordStrength.score ? passwordStrength.color : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força: <span className={passwordStrength.score >= 4 ? "text-green-600 font-medium" : "text-orange-500 font-medium"}>{passwordStrength.label}</span>
                    {passwordStrength.errors.length > 0 && (
                      <span className="text-destructive"> — faltam: {passwordStrength.errors.join(", ")}</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
            </div>

            {passwordError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {passwordError}
              </p>
            )}

            <Button
              onClick={handleSavePassword}
              className="w-full sm:w-auto"
              disabled={!passwordsMatch || !currentPassword || isLoadingPassword}
            >
              {passwordSaved ? (
                <><Check className="mr-2 h-4 w-4" />Senha Alterada</>
              ) : isLoadingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

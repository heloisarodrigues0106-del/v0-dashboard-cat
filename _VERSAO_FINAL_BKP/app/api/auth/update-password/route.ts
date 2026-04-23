import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
  if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.'
  if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.'
  if (!/[^a-zA-Z0-9]/.test(password)) return 'A senha deve conter pelo menos um caractere especial (ex: @, #, !).'
  return null
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: { currentPassword?: string; newPassword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const { currentPassword, newPassword } = body

  if (!currentPassword || typeof currentPassword !== 'string') {
    return NextResponse.json({ error: 'Senha atual é obrigatória.' }, { status: 400 })
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Nova senha é obrigatória.' }, { status: 400 })
  }

  // Validar força da nova senha
  const strengthError = validatePasswordStrength(newPassword)
  if (strengthError) {
    return NextResponse.json({ error: strengthError }, { status: 400 })
  }

  // Verificar senha atual re-autenticando o usuário
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
  }

  // Atualizar para a nova senha
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

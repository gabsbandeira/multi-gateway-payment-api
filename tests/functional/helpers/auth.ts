import User from '#models/user'

export async function login() {
  const user = await User.firstOrCreate(
    { email: 'teste@email.com' },
    {
      password: '12345678',
      role: 'user',
    }
  )

  const token = await User.accessTokens.create(user)

  return token.value!.release()
}

import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token: token.value!.release(),
      },
    })
  }

  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return response.ok({
      message: 'Logout realizado com sucesso',
    })
  }
}

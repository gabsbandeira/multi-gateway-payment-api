import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SignupController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

    const user = await User.create({
      role: 'user',
      email: payload.email,
      password: payload.password,
    })

    const token = await User.accessTokens.create(user)

    return response.created({
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token: token.value!.release(),
      },
    })
  }
}

import { test } from '@japa/runner'
import { login } from '../helpers/auth.ts'
import User from '#models/user'

test.group('Auth Logout', (group) => {
  group.each.teardown(async () => {
    await User.query().delete()
  })
  test('Deve fazer logout', async ({ client }) => {
    const token = await login()

    const response = await client
      .post('/api/v1/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })
})

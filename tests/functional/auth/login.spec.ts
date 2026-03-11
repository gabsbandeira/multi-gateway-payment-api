import { test } from '@japa/runner'
import User from '#models/user'

test.group('Auth Login', (group) => {
  group.each.teardown(async () => {
    await User.query().delete()
  })

  test('Deve fazer login', async ({ client, assert }) => {
    await User.create({
      email: 'login@email.com',
      password: '12345678',
      role: 'user',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'login@email.com',
      password: '12345678',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Login realizado com sucesso',
    })

    const body = response.body()

    assert.exists(body.data)
    assert.exists(body.data.user)
    assert.exists(body.data.token)
    assert.equal(body.data.user.email, 'login@email.com')
  })

  test('Deve falhar ao fazer login com senha errada', async ({ client }) => {
    await User.create({
      email: 'loginfail@email.com',
      password: '12345678',
      role: 'user',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'loginfail@email.com',
      password: '1223334444',
    })

    response.assertStatus(400)
  })
})

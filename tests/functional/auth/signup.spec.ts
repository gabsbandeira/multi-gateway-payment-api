import { test } from '@japa/runner'
import User from '#models/user'

test.group('Auth Signup', (group) => {
  group.each.teardown(async () => {
    await User.query().delete()
  })

  test('Deve criar um usuário com sucesso', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      email: 'signup@email.com',
      password: '12345678',
      passwordConfirmation: '12345678',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Usuário criado com sucesso',
    })

    const body = response.body()

    assert.exists(body.data)
    assert.exists(body.data.user)
    assert.exists(body.data.token)

    assert.exists(body.data.user.id)
    assert.equal(body.data.user.email, 'signup@email.com')
  })

  test('Deve falhar ao criar usuário com email duplicado', async ({ client }) => {
    await client.post('/api/v1/auth/signup').json({
      email: 'duplicado@email.com',
      password: '12345678',
      passwordConfirmation: '12345678',
    })

    const response = await client.post('/api/v1/auth/signup').json({
      email: 'duplicado@email.com',
      password: '12345678',
      passwordConfirmation: '12345678',
    })

    response.assertStatus(422)
  })

  test('Deve falhar ao criar usuário com email inválido', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      email: 'signupemail.com',
      password: '12345678',
      passwordConfirmation: '12345678',
    })

    response.assertStatus(422)
  })
})

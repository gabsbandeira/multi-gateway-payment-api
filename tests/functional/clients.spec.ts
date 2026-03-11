import { test } from '@japa/runner'
import { login } from './helpers/auth.ts'
import User from '#models/user'
import Client from '#models/client'

test.group('Clients', (group) => {
  group.each.teardown(async () => {
    await User.query().delete()
    await Client.query().delete()
  })

  test('Deve criar um cliente com sucesso', async ({ client, assert }) => {
    const token = await login()

    const response = await client
      .post('/api/v1/clients')
      .json({
        name: 'Cliente 1',
        email: 'cliente@email.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Cliente criado com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        email: string
      }
    }

    assert.exists(body.data)

    assert.exists(body.data.id)
    assert.equal(body.data.email, 'cliente@email.com')
  })

  test('Deve falhar ao criar um cliente com email invalido', async ({ client }) => {
    const token = await login()

    const response = await client
      .post('/api/v1/clients')
      .json({
        name: 'Cliente com Erro',
        email: 'clienteemail.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve listar vários clientes', async ({ client, assert }) => {
    const token = await login()

    await Client.createMany([
      { name: 'Gabi', email: 'gabi@email.com' },
      { name: 'Mimi', email: 'mimi@email.com' },
      { name: 'Jason', email: 'jason@email.com' },
    ])

    const response = await client.get('/api/v1/clients').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Clientes listados com sucesso',
    })

    const body = response.body() as {
      data: Array<{
        id: number
        name: string
        email: string
      }>
    }

    assert.isAtLeast(body.data.length, 3)
  })

  test('Deve buscar um cliente por id e retornar o cliente', async ({ client, assert }) => {
    const token = await login()

    const createdClient = await Client.create({
      name: 'Cliente para Buscar',
      email: 'cliente1@email.com',
    })

    const response = await client
      .get(`/api/v1/clients/${createdClient.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Cliente encontrado com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        email: string
      }
    }

    assert.exists(body.data)
    assert.equal(body.data.id, createdClient.id)
    assert.equal(body.data.email, 'cliente1@email.com')
  })

  test('Deve falhar ao buscar um cliente por id incorreto', async ({ client }) => {
    const token = await login()

    const response = await client
      .get('/api/v1/clients/9999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('Deve atualizar um cliente com sucesso', async ({ client, assert }) => {
    const token = await login()

    const createdClient = await Client.create({
      name: 'Cliente para Atualizar',
      email: 'cliente_atualizar@email.com',
    })

    const response = await client
      .put(`/api/v1/clients/${createdClient.id}`)
      .json({
        name: 'Cliente Atualizado',
        email: 'cliente_atualizado@email.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Cliente atualizado com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        email: string
      }
    }

    assert.exists(body.data)
    assert.equal(body.data.id, createdClient.id)
    assert.equal(body.data.name, 'Cliente Atualizado')
    assert.equal(body.data.email, 'cliente_atualizado@email.com')
  })

  test('Deve falhar ao atualizar um cliente com dados inválidos', async ({ client }) => {
    const token = await login()

    const createdClient = await Client.create({
      name: 'Cliente para Atualizar Erro',
      email: 'cliente_atualizar_teste@email.com',
    })

    const response = await client
      .put(`/api/v1/clients/${createdClient.id}`)
      .json({
        name: 'Cliente Atualizado com Erro',
        email: 'cliente_erro_email.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve falhar ao tentar atualizar cliente com id incorreto', async ({ client }) => {
    const token = await login()

    const response = await client
      .put(`/api/v1/clients/99999`)
      .json({
        name: 'Cliente Com Id Incorreto',
        email: 'cliente_atualizado_id@email.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Cliente não encontrado',
    })
  })

  test('Deve deletar um cliente com sucesso', async ({ client, assert }) => {
    const token = await login()

    const createdClient = await Client.create({
      name: 'Cliente para Deletar',
      email: 'cliente_deletar@email.com',
    })

    const response = await client
      .delete(`/api/v1/clients/${createdClient.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Cliente removido com sucesso',
    })

    const deletedClient = await Client.find(createdClient.id)
    assert.isNull(deletedClient)
  })

  test('Deve falhar ao tentar deletar com id incorreto', async ({ client }) => {
    const token = await login()

    const response = await client
      .delete(`/api/v1/clients/999999999`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Cliente não encontrado',
    })
  })
})

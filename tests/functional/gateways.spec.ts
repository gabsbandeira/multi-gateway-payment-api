import { test } from '@japa/runner'
import { login } from './helpers/auth.ts'
import Gateway from '#models/gateway'

test.group('Gateways', (group) => {
  let token: string

  group.setup(async () => {
    token = await login()
  })

  group.each.setup(async () => {
    await Gateway.query().where('id', 1).update({ isActive: true, priority: 1 })
  })

  test('Alterar a prioridade do gateway com sucesso', async ({ client, assert }) => {
    const response = await client
      .patch('/api/v1/gateways/1/priority')
      .json({ priority: 5 })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Prioridade atualizada com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        isActive: boolean
        priority: number
      }
    }

    assert.exists(body.data)
    assert.exists(body.data.id)
    assert.equal(body.data.name, 'Gateway1')
    assert.equal(body.data.isActive, true)
    assert.equal(body.data.priority, 5)
  })

  test('Não deve alterar a prioridade de um gateway inexistente', async ({ client }) => {
    const response = await client
      .patch('/api/v1/gateways/999/priority')
      .json({ priority: 5 })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Gateway não encontrado',
    })
  })

  test('Desativar um gateway com sucesso', async ({ client, assert }) => {
    const response = await client
      .patch('/api/v1/gateways/1/toggle')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Gateway desativado com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        isActive: boolean
        priority: number
      }
    }

    assert.exists(body.data)
    assert.exists(body.data.id)
    assert.equal(body.data.name, 'Gateway1')
    assert.equal(body.data.isActive, false)
  })

  test('Não deve ativar/desativar um gateway inexistente', async ({ client }) => {
    const response = await client
      .patch('/api/v1/gateways/999/toggle')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Gateway não encontrado',
    })
  })
})

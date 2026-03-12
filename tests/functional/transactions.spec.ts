import { test } from '@japa/runner'
import { login } from './helpers/auth.js'
import User from '#models/user'
import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'

test.group('Transactions', (group) => {
  let token: string
  let clientId: number
  let productId: number

  group.setup(async () => {
    token = await login()
  })

  group.each.setup(async () => {
    const client = await Client.create({ name: 'Cliente Teste', email: 'cliente@teste.com' })
    const product = await Product.create({ name: 'Produto Teste', amount: 100 })

    clientId = client.id
    productId = product.id
  })

  group.each.teardown(async () => {
    await Transaction.query().delete()
    await Product.query().delete()
    await Client.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  test('Deve criar uma transação com sucesso', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: 100,
        products: [{ productId, quantity: 1 }],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Transação criada com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        status: string
        amount: number
        clientId: number
        products: Array<{ productId: number; quantity: number }>
      }
    }

    assert.exists(body.data)
    assert.exists(body.data.id)
    assert.equal(body.data.clientId, clientId)
    assert.equal(body.data.amount, 100)
    assert.isArray(body.data.products)
    assert.equal(body.data.products[0].productId, productId)
    assert.equal(body.data.products[0].quantity, 1)
  })

  test('Deve falhar e não criar a transação quando um produto for inválido', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: 100,
        products: [
          { productId, quantity: 1 },
          { productId: 999999, quantity: 1 },
        ],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)

    const transactions = await Transaction.query().where('clientId', clientId)
    assert.equal(transactions.length, 0)
  })

  test('Deve criar uma transação com múltiplos produtos', async ({ client, assert }) => {
    const product2 = await Product.create({ name: 'Produto 2', amount: 200 })

    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: 300,
        products: [
          { productId, quantity: 1 },
          { productId: product2.id, quantity: 2 },
        ],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(201)

    const body = response.body() as {
      data: { products: Array<{ productId: number; quantity: number }> }
    }

    assert.equal(body.data.products.length, 2)
  })

  test('Deve falhar ao criar transação sem produtos', async ({ client }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: 100,
        products: [],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve falhar ao criar transação com clientId inexistente', async ({ client }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId: 999999,
        amount: 100,
        products: [{ productId, quantity: 1 }],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve falhar ao criar transação com productId inexistente', async ({ client }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: 100,
        products: [{ productId: 999999, quantity: 1 }],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve falhar ao criar transação com cardLastNumbers inválido', async ({ client }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: 100,
        cardLastNumbers: 'ABCD',
        products: [{ productId, quantity: 1 }],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve falhar ao criar transação com amount inválido', async ({ client }) => {
    const response = await client
      .post('/api/v1/transactions')
      .json({
        clientId,
        amount: -100,
        products: [{ productId, quantity: 1 }],
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve listar transações com sucesso', async ({ client, assert }) => {
    await Transaction.createMany([
      { clientId, amount: 100, status: 'paid' },
      { clientId, amount: 200, status: 'failed' },
    ])

    const response = await client
      .get('/api/v1/transactions')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Transações listadas com sucesso',
    })

    const body = response.body() as {
      data: Array<{ id: number; status: string; amount: number }>
    }

    assert.isAtLeast(body.data.length, 2)
  })

  test('Deve buscar uma transação por id com sucesso', async ({ client, assert }) => {
    const transaction = await Transaction.create({
      clientId,
      amount: 100,
      status: 'paid',
    })

    const response = await client
      .get(`/api/v1/transactions/${transaction.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Transação encontrada com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        status: string
        amount: number
        clientId: number
        products: Array<{ productId: number; quantity: number }>
      }
    }

    assert.exists(body.data)
    assert.equal(body.data.id, transaction.id)
    assert.equal(body.data.clientId, clientId)
    assert.isArray(body.data.products)
  })

  test('Deve falhar ao buscar transação com id inexistente', async ({ client }) => {
    const response = await client
      .get('/api/v1/transactions/999999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Transação não encontrada',
    })
  })

  test('Deve deletar uma transação com sucesso', async ({ client, assert }) => {
    const transaction = await Transaction.create({
      clientId,
      amount: 100,
      status: 'paid',
    })

    const response = await client
      .delete(`/api/v1/transactions/${transaction.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Transação removida com sucesso',
    })

    const deletedTransaction = await Transaction.find(transaction.id)
    assert.isNull(deletedTransaction)
  })

  test('Deve falhar ao deletar transação com id inexistente', async ({ client }) => {
    const response = await client
      .delete('/api/v1/transactions/999999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Transação não encontrada',
    })
  })
})

import { test } from '@japa/runner'
import { login } from './helpers/auth.js'
import User from '#models/user'
import Product from '#models/product'

test.group('Products', (group) => {
  let token: string

  group.setup(async () => {
    token = await login()
  })

  group.each.teardown(async () => {
    await Product.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  test('Deve criar um produto com sucesso', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/products')
      .json({
        name: 'Produto 1',
        amount: 100,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Produto criado com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        amount: number
      }
    }

    assert.exists(body.data)

    assert.exists(body.data.id)
    assert.equal(body.data.name, 'Produto 1')
    assert.equal(body.data.amount, 100)
  })

  test('Deve falhar ao criar um produto com amount inválido', async ({ client }) => {
    const response = await client
      .post('/api/v1/products')
      .json({
        name: 'Produto com Erro',
        amount: '100,00',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve listar vários produtos', async ({ client, assert }) => {
    await Product.createMany([
      { name: 'Tv', amount: 100 },
      { name: 'Computador', amount: 200 },
      { name: 'Cadeira', amount: 300 },
    ])

    const response = await client.get('/api/v1/products').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Produtos listados com sucesso',
    })

    const body = response.body() as {
      data: Array<{
        id: number
        name: string
        amount: number
      }>
    }

    assert.isAtLeast(body.data.length, 3)
  })

  test('Deve buscar um produto por id e retornar o produto', async ({ client, assert }) => {
    const createdProduct = await Product.create({
      name: 'Produto para Buscar',
      amount: 100,
    })

    const response = await client
      .get(`/api/v1/products/${createdProduct.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Produto encontrado com sucesso',
    })
    const body = response.body() as {
      data: {
        id: number
        name: string
        amount: number
      }
    }

    assert.exists(body.data)
    assert.equal(body.data.id, createdProduct.id)
    assert.equal(body.data.amount, 100)
  })

  test('Deve falhar ao buscar um produto por id incorreto', async ({ client }) => {
    const response = await client
      .get('/api/v1/products/9999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Produto não encontrado',
    })
  })

  test('Deve atualizar um produto com sucesso', async ({ client, assert }) => {
    const createdProduct = await Product.create({
      name: 'Produto para Atualizar',
      amount: 100,
    })

    const response = await client
      .put(`/api/v1/products/${createdProduct.id}`)
      .json({
        name: 'Produto Atualizado',
        amount: 200,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Produto atualizado com sucesso',
    })

    const body = response.body() as {
      data: {
        id: number
        name: string
        amount: number
      }
    }

    assert.exists(body.data)
    assert.equal(body.data.id, createdProduct.id)
    assert.equal(body.data.name, 'Produto Atualizado')
    assert.equal(body.data.amount, 200)
  })

  test('Deve falhar ao atualizar um produto com dados inválidos', async ({ client }) => {
    const createdProduct = await Product.create({
      name: 'Produto para Atualizar Erro',
      amount: 100,
    })

    const response = await client
      .put(`/api/v1/products/${createdProduct.id}`)
      .json({
        name: 'Produto Atualizado com Erro',
        amount: '100,00',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('Deve falhar ao tentar atualizar produto com id incorreto', async ({ client }) => {
    const response = await client
      .put(`/api/v1/products/99999`)
      .json({
        name: 'Produto Com Id Incorreto',
        amount: 100,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Produto não encontrado',
    })
  })

  test('Deve deletar um produto com sucesso', async ({ client, assert }) => {
    const createdProduct = await Product.create({
      name: 'Produto para Deletar',
      amount: 100,
    })

    const response = await client
      .delete(`/api/v1/products/${createdProduct.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Produto removido com sucesso',
    })

    const deletedProduct = await Product.find(createdProduct.id)
    assert.isNull(deletedProduct)
  })

  test('Deve falhar ao tentar deletar com id incorreto', async ({ client }) => {
    const response = await client
      .delete(`/api/v1/products/999999999`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Produto não encontrado',
    })
  })
})

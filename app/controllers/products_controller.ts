import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import {
  productIdValidator,
  createProductValidator,
  updateProductValidator,
} from '#validators/product'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.all()

    return response.ok({
      message: 'Produtos listados com sucesso',
      data: products,
    })
  }

  async show({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(productIdValidator, {
      data: params,
    })

    const product = await Product.find(id)

    if (!product) {
      return response.notFound({
        message: 'Produto não encontrado',
      })
    }

    return response.ok({
      message: 'Produto encontrado com sucesso',
      data: product,
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)

    const product = await Product.create(payload)

    return response.created({
      message: 'Produto criado com sucesso',
      data: product,
    })
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(productIdValidator, {
      data: params,
    })

    const product = await Product.find(id)

    if (!product) {
      return response.notFound({
        message: 'Produto não encontrado',
      })
    }

    const payload = await request.validateUsing(updateProductValidator)

    product.merge(payload)
    await product.save()

    return response.ok({
      message: 'Produto atualizado com sucesso',
      data: product,
    })
  }

  async destroy({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(productIdValidator, {
      data: params,
    })

    const product = await Product.find(id)

    if (!product) {
      return response.notFound({
        message: 'Produto não encontrado',
      })
    }

    await product.delete()

    return response.ok({
      message: 'Produto removido com sucesso',
    })
  }
}

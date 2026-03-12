import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { transactionIdValidator, createTransactionValidator } from '#validators/transaction'

export default class TransactionsController {
  async index({ response }: HttpContext) {
    const transactions = await Transaction.all()

    const data = transactions.map((transaction) => ({
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      clientId: transaction.clientId,
      createdAt: transaction.createdAt?.toISO(),
    }))

    return response.ok({
      message: 'Transações listadas com sucesso',
      data,
    })
  }

  async show({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(transactionIdValidator, {
      data: params,
    })

    const transaction = await Transaction.query()
      .where('id', id)
      .preload('transactionProducts')
      .first()

    if (!transaction) {
      return response.notFound({
        message: 'Transação não encontrada',
      })
    }

    return response.ok({
      message: 'Transação encontrada com sucesso',
      data: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        cardLastNumbers: transaction.cardLastNumbers,
        clientId: transaction.clientId,
        createdAt: transaction.createdAt?.toISO(),
        products: transaction.transactionProducts.map((tp) => ({
          productId: tp.productId,
          quantity: tp.quantity,
        })),
      },
    })
  }

  async store({ request, response }: HttpContext) {
    try {
      const { products, ...payload } = await request.validateUsing(createTransactionValidator)

      // TODO: substituir pelo service real de gateways
      const status = 'paid'

      const transaction = await Transaction.create({ ...payload, status })

      await Promise.all(
        products.map((item) =>
          transaction.related('transactionProducts').create({
            productId: item.productId,
            quantity: item.quantity,
          })
        )
      )

      await transaction.load('transactionProducts')

      return response.created({
        message: 'Transação criada com sucesso',
        data: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          clientId: transaction.clientId,
          createdAt: transaction.createdAt?.toISO(),
          products: transaction.transactionProducts.map((tp) => ({
            productId: tp.productId,
            quantity: tp.quantity,
          })),
        },
      })
    } catch (error) {
      console.log('Erro ao criar transação:', error)
      throw error
    }
  }

  async destroy({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(transactionIdValidator, {
      data: params,
    })

    const transaction = await Transaction.find(id)

    if (!transaction) {
      return response.notFound({
        message: 'Transação não encontrada',
      })
    }

    await transaction.delete()

    return response.ok({
      message: 'Transação removida com sucesso',
    })
  }
}

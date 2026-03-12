import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { transactionIdValidator, createTransactionValidator } from '#validators/transaction'
import db from '@adonisjs/lucid/services/db'

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
    const { products, ...payload } = await request.validateUsing(createTransactionValidator)

    // TODO: substituir quando implementar os gateways
    const status = 'paid' as const

    const transactionWithProducts = await db.transaction(async (trx) => {
      const transactionRecord = await Transaction.create({ ...payload, status }, { client: trx })

      await Promise.all(
        products.map((item) =>
          transactionRecord
            .related('transactionProducts')
            .create({ productId: item.productId, quantity: item.quantity }, { client: trx })
        )
      )

      return transactionRecord
    })

    await transactionWithProducts.load('transactionProducts')

    return response.created({
      message: 'Transação criada com sucesso',
      data: {
        id: transactionWithProducts.id,
        status: transactionWithProducts.status,
        amount: transactionWithProducts.amount,
        clientId: transactionWithProducts.clientId,
        createdAt: transactionWithProducts.createdAt?.toISO(),
        products: transactionWithProducts.transactionProducts.map((tp) => ({
          productId: tp.productId,
          quantity: tp.quantity,
        })),
      },
    })
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

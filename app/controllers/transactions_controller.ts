import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Transaction from '#models/transaction'
import Product from '#models/product'
import { transactionIdValidator, createTransactionValidator } from '#validators/transaction'
import Client from '#models/client'
import { PaymentService } from '#services/payment_services'

export default class TransactionsController {
  async index({ response }: HttpContext) {
    const transactions = await Transaction.query().preload('client').preload('gateway')

    const data = transactions.map((transaction) => ({
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      externalId: transaction.externalId,
      createdAt: transaction.createdAt?.toISO(),
      client: {
        id: transaction.client.id,
        name: transaction.client.name,
        email: transaction.client.email,
      },
      gateway: transaction.gateway
        ? { id: transaction.gateway.id, name: transaction.gateway.name }
        : null,
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
      .preload('client')
      .preload('gateway')
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
        externalId: transaction.externalId,
        cardLastNumbers: transaction.cardLastNumbers,
        createdAt: transaction.createdAt?.toISO(),
        client: {
          id: transaction.client.id,
          name: transaction.client.name,
          email: transaction.client.email,
        },
        gateway: transaction.gateway
          ? { id: transaction.gateway.id, name: transaction.gateway.name }
          : null,
        products: transaction.transactionProducts.map((tp) => ({
          productId: tp.productId,
          quantity: tp.quantity,
        })),
      },
    })
  }

  async store({ request, response }: HttpContext) {
    const { products, cardNumber, cvv, ...payload } = await request.validateUsing(
      createTransactionValidator
    )
    const client = await Client.findOrFail(payload.clientId)
    const paymentService = new PaymentService()

    const cardLastNumbers = cardNumber.slice(-4)
    const productsWithPrice = await Product.findMany(products.map((p) => p.productId))

    const amount = products.reduce((sum, item) => {
      const matchedProduct = productsWithPrice.find((p) => p.id === item.productId)!
      return sum + matchedProduct.amount * item.quantity
    }, 0)

    const { externalId, gatewayId, status } = await paymentService
      .charge({
        amount,
        name: client.name,
        email: client.email,
        cardNumber,
        cvv,
      })
      .then((result) => ({ ...result, status: 'paid' as const }))
      .catch(() => ({ externalId: null, gatewayId: null, status: 'failed' as const }))

    const newTransaction = await db.transaction(async (trx) => {
      const transactionRecord = await Transaction.create(
        { ...payload, amount, status, cardLastNumbers, externalId, gatewayId },
        { client: trx }
      )

      await Promise.all(
        products.map((item) =>
          transactionRecord
            .related('transactionProducts')
            .create({ productId: item.productId, quantity: item.quantity }, { client: trx })
        )
      )

      return transactionRecord
    })

    await newTransaction.load('transactionProducts')

    return response.created({
      message: 'Transação criada com sucesso',
      data: {
        id: newTransaction.id,
        status: newTransaction.status,
        amount: newTransaction.amount,
        clientId: newTransaction.clientId,
        createdAt: newTransaction.createdAt?.toISO(),
        products: newTransaction.transactionProducts.map((tp) => ({
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

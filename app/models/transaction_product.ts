import { TransactionsProductSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'
import Product from '#models/product'

export default class TransactionProduct extends TransactionsProductSchema {
  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}

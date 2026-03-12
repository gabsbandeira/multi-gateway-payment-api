import vine from '@vinejs/vine'

export const transactionIdValidator = vine.create({
  id: vine.number().positive(),
})

export const createTransactionValidator = vine.create({
  clientId: vine.number().positive().exists({ table: 'clients', column: 'id' }),
  amount: vine.number().positive(),
  cardLastNumbers: vine.string().fixedLength(4).regex(/^\d+$/).optional(),
  externalId: vine.string().optional(),
  products: vine
    .array(
      vine.object({
        productId: vine.number().positive().exists({ table: 'products', column: 'id' }),
        quantity: vine.number().positive().withoutDecimals(),
      })
    )
    .minLength(1),
})

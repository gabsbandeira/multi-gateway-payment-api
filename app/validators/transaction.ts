import vine from '@vinejs/vine'

export const transactionIdValidator = vine.create({
  id: vine.number().positive(),
})

export const createTransactionValidator = vine.create({
  clientId: vine.number().positive().exists({ table: 'clients', column: 'id' }),
  cardNumber: vine.string().fixedLength(16).regex(/^\d+$/),
  cvv: vine.string().minLength(3).maxLength(4).regex(/^\d+$/),
  products: vine
    .array(
      vine.object({
        productId: vine.number().positive().exists({ table: 'products', column: 'id' }),
        quantity: vine.number().positive().withoutDecimals(),
      })
    )
    .minLength(1),
})

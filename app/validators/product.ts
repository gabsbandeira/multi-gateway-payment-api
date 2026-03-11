import vine from '@vinejs/vine'

const name = () => vine.string().minLength(2).maxLength(255)
const amount = () => vine.number().positive()

export const productIdValidator = vine.create({
  id: vine.number().positive(),
})

export const createProductValidator = vine.create({
  name: name(),
  amount: amount(),
})

export const updateProductValidator = vine.create({
  name: name().optional(),
  amount: amount().optional(),
})

import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const name = () => vine.string().minLength(2).maxLength(255)

export const clientIdValidator = vine.create({
  id: vine.number().positive(),
})

export const createClientValidator = vine.create({
  name: name(),
  email: email().unique({ table: 'clients', column: 'email' }),
})

export const updateClientValidator = vine.create({
  name: name().optional(),
  email: email().optional(),
})

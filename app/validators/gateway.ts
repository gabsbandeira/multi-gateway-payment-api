import vine from '@vinejs/vine'

export const gatewayIdValidator = vine.create({
  id: vine.number().positive(),
})

export const gatewayPriorityValidator = vine.create({
  priority: vine.number().positive(),
})

import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { clientIdValidator, createClientValidator, updateClientValidator } from '#validators/client'

export default class ClientsController {
  async index({ response }: HttpContext) {
    const clients = await Client.all()

    const clientsData = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
    }))

    return response.ok({
      message: 'Clientes listados com sucesso',
      data: clientsData,
    })
  }

  async show({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(clientIdValidator, {
      data: params,
    })

    const client = await Client.find(id)

    if (!client) {
      return response.notFound({
        message: 'Cliente não encontrado',
      })
    }

    return response.ok({
      message: 'Cliente encontrado com sucesso',
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createClientValidator)

    const client = await Client.create(payload)

    return response.created({
      message: 'Cliente criado com sucesso',
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    })
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(clientIdValidator, {
      data: params,
    })

    const client = await Client.find(id)

    if (!client) {
      return response.notFound({
        message: 'Cliente não encontrado',
      })
    }

    const payload = await request.validateUsing(updateClientValidator)

    client.merge(payload)
    await client.save()

    return response.ok({
      message: 'Cliente atualizado com sucesso',
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    })
  }

  async destroy({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(clientIdValidator, {
      data: params,
    })

    const client = await Client.find(id)

    if (!client) {
      return response.notFound({
        message: 'Cliente não encontrado',
      })
    }

    await client.delete()

    return response.ok({
      message: 'Cliente removido com sucesso',
    })
  }
}

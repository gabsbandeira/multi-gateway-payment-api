import type { HttpContext } from '@adonisjs/core/http'
import { gatewayIdValidator, gatewayPriorityValidator } from '#validators/gateway'
import Gateway from '#models/gateway'

export default class GatewaysController {
  async toggleStatus({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(gatewayIdValidator, {
      data: params,
    })

    const gateway = await Gateway.find(id)

    if (!gateway) {
      return response.notFound({
        message: 'Gateway não encontrado',
      })
    }

    gateway.isActive = !gateway.isActive
    await gateway.save()

    return response.ok({
      message: `Gateway ${gateway.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: {
        id: gateway.id,
        name: gateway.name,
        isActive: gateway.isActive,
        priority: gateway.priority,
      },
    })
  }

  async updatePriority({ params, request, response }: HttpContext) {
    const { id } = await request.validateUsing(gatewayIdValidator, {
      data: params,
    })
    const { priority } = await request.validateUsing(gatewayPriorityValidator)

    const gateway = await Gateway.find(id)

    if (!gateway) {
      return response.notFound({
        message: 'Gateway não encontrado',
      })
    }

    gateway.priority = priority
    await gateway.save()

    return response.ok({
      message: `Prioridade atualizada com sucesso`,
      data: {
        id: gateway.id,
        name: gateway.name,
        isActive: gateway.isActive,
        priority: gateway.priority,
      },
    })
  }
}

import Gateway from '#models/gateway'
import { Gateway1Service } from '../gateways/gateway1_service.js'
import { Gateway2Service } from '../gateways/gateway2_service.js'
import type { ChargeData, ChargeResult, GatewayInterface } from '../gateways/gateway_interface.js'

export class PaymentService {
  private resolveGateway(name: string): GatewayInterface {
    if (name === 'Gateway1') return new Gateway1Service()
    if (name === 'Gateway2') return new Gateway2Service()
    throw new Error(`Gateway ${name} não encontrado`)
  }

  async charge(data: ChargeData): Promise<ChargeResult> {
    const gateways = await Gateway.query().where('isActive', true).orderBy('priority', 'asc')

    for (const gateway of gateways) {
      try {
        return await this.resolveGateway(gateway.name).charge(data)
      } catch {
        continue
      }
    }

    throw new Error('Todos os gateways falharam')
  }
}

import env from '#start/env'
import type { ChargeData, ChargeResult, GatewayInterface } from './gateway_interface.js'

export class Gateway2Service implements GatewayInterface {
  private readonly baseUrl = env.get('GATEWAY2_URL')
  private readonly authToken = env.get('GATEWAY2_AUTH_TOKEN')
  private readonly authSecret = env.get('GATEWAY2_AUTH_SECRET')

  async charge(data: ChargeData): Promise<ChargeResult> {
    const response = await fetch(`${this.baseUrl}/transacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Gateway-Auth-Token': this.authToken,
        'Gateway-Auth-Secret': this.authSecret,
      },
      body: JSON.stringify({
        valor: data.amount,
        nome: data.name,
        email: data.email,
        numeroCartao: data.cardNumber,
        cvv: data.cvv,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) throw new Error('Gateway 2 falhou')

    const result = (await response.json()) as { id: string }
    return { externalId: result.id, gatewayId: 2 }
  }
}

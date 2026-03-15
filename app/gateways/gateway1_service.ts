import env from '#start/env'
import type { ChargeData, ChargeResult, GatewayInterface } from './gateway_interface.js'

export class Gateway1Service implements GatewayInterface {
  private readonly baseUrl = env.get('GATEWAY1_URL')
  private readonly email = env.get('GATEWAY1_EMAIL')
  private readonly token = env.get('GATEWAY1_TOKEN')

  private async getToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, token: this.token }),
      signal: AbortSignal.timeout(5000),
    })

    const data = (await response.json()) as { token: string }
    return data.token
  }

  async charge(data: ChargeData): Promise<ChargeResult> {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: data.amount,
        name: data.name,
        email: data.email,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) throw new Error('Gateway 1 falhou')

    const result = (await response.json()) as { id: string }
    return { externalId: result.id, gatewayId: 1 }
  }

  async refund(externalId: string): Promise<void> {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}/transactions/${externalId}/charge_back`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) throw new Error('Reembolso falhou no Gateway 1')
  }
}

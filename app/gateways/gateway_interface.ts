export interface ChargeData {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface ChargeResult {
  externalId: string
  gatewayId: number
}

export interface GatewayInterface {
  charge(data: ChargeData): Promise<ChargeResult>
  refund(externalId: string): Promise<void>
}

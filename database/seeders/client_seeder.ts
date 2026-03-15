import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Client from '#models/client'

export default class ClientSeeder extends BaseSeeder {
  async run() {
    await Client.updateOrCreateMany('email', [
      { name: 'Tony Stark', email: 'tony.stark@email.com' },
      { name: 'Bruce Wayne', email: 'bruce.wayne@email.com' },
    ])
  }
}

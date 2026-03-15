import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await User.updateOrCreateMany('email', [
      {
        email: 'user@test.com',
        password: 'test1234',
        role: 'user',
      },
    ])
  }
}

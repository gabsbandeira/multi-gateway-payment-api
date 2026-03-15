import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'

export default class ProductSeeder extends BaseSeeder {
  async run() {
    await Product.createMany([
      { name: 'Televisao', amount: 100 },
      { name: 'Geladeira', amount: 200 },
      { name: 'Microondas', amount: 300 },
      { name: 'Fogao', amount: 400 },
      { name: 'Maquina de Lavar', amount: 500 },
    ])
  }
}

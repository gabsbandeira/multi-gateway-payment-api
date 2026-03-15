/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.Signup, 'store'])
        router.post('login', [controllers.Login, 'store'])
        router.post('logout', [controllers.Login, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/', [controllers.Clients, 'index'])
        router.get('/:id', [controllers.Clients, 'show'])
        router.post('/', [controllers.Clients, 'store'])
        router.put('/:id', [controllers.Clients, 'update'])
        router.delete('/:id', [controllers.Clients, 'destroy'])
      })
      .prefix('clients')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Products, 'index'])
        router.get('/:id', [controllers.Products, 'show'])
        router.post('/', [controllers.Products, 'store'])
        router.put('/:id', [controllers.Products, 'update'])
        router.delete('/:id', [controllers.Products, 'destroy'])
      })
      .prefix('products')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Transactions, 'index'])
        router.get('/:id', [controllers.Transactions, 'show'])
        router.post('/', [controllers.Transactions, 'store'])
        router.post('/:id/refund', [controllers.Transactions, 'refund'])
        router.delete('/:id', [controllers.Transactions, 'destroy'])
      })
      .prefix('transactions')
      .use(middleware.auth())

    router
      .group(() => {
        router.patch('/:id/toggle', [controllers.Gateways, 'toggleStatus'])
        router.patch('/:id/priority', [controllers.Gateways, 'updatePriority'])
      })
      .prefix('gateways')
      .use(middleware.auth())
  })
  .prefix('/api/v1')

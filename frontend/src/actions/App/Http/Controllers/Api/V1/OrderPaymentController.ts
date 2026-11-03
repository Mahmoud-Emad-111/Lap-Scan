import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/payments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::index
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:20
 * @route '/api/v1/payments'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::store
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:51
 * @route '/api/v1/orders/{order}/payments'
 */
export const store = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/orders/{order}/payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::store
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:51
 * @route '/api/v1/orders/{order}/payments'
 */
store.url = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { order: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { order: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    order: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        order: typeof args.order === 'object'
                ? args.order.id
                : args.order,
                }

    return store.definition.url
            .replace('{order}', parsedArgs.order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::store
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:51
 * @route '/api/v1/orders/{order}/payments'
 */
store.post = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::store
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:51
 * @route '/api/v1/orders/{order}/payments'
 */
    const storeForm = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\OrderPaymentController::store
 * @see app/Http/Controllers/Api/V1/OrderPaymentController.php:51
 * @route '/api/v1/orders/{order}/payments'
 */
        storeForm.post = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const OrderPaymentController = { index, store }

export default OrderPaymentController
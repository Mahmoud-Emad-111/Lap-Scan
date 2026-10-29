import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\OrderController::index
 * @see app/Http/Controllers/Api/V1/OrderController.php:19
 * @route '/api/v1/orders'
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
* @see \App\Http\Controllers\Api\V1\OrderController::store
 * @see app/Http/Controllers/Api/V1/OrderController.php:54
 * @route '/api/v1/orders'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/orders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\OrderController::store
 * @see app/Http/Controllers/Api/V1/OrderController.php:54
 * @route '/api/v1/orders'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OrderController::store
 * @see app/Http/Controllers/Api/V1/OrderController.php:54
 * @route '/api/v1/orders'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\OrderController::store
 * @see app/Http/Controllers/Api/V1/OrderController.php:54
 * @route '/api/v1/orders'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\OrderController::store
 * @see app/Http/Controllers/Api/V1/OrderController.php:54
 * @route '/api/v1/orders'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
export const show = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/orders/{order}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
show.url = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{order}', parsedArgs.order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
show.get = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
show.head = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
    const showForm = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
        showForm.get = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\OrderController::show
 * @see app/Http/Controllers/Api/V1/OrderController.php:66
 * @route '/api/v1/orders/{order}'
 */
        showForm.head = (args: { order: string | number | { id: string | number } } | [order: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const orders = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
}

export default orders
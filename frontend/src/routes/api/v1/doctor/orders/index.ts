import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
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
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/doctor/orders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
export const show = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/orders/{order}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
show.url = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { order: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    order: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        order: args.order,
                }

    return show.definition.url
            .replace('{order}', parsedArgs.order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
show.get = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
show.head = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
    const showForm = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
        showForm.get = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
        showForm.head = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
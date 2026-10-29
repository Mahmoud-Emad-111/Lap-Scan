import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
export const orders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

orders.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
orders.url = (options?: RouteQueryOptions) => {
    return orders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
orders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
orders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orders.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
    const ordersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: orders.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
        ordersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:17
 * @route '/api/v1/patient/orders'
 */
        ordersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: orders.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    orders.form = ordersForm
/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
export const results = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: results.url(options),
    method: 'get',
})

results.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/results',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
results.url = (options?: RouteQueryOptions) => {
    return results.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
results.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: results.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
results.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: results.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
    const resultsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: results.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
        resultsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: results.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
 * @see app/Http/Controllers/Api/V1/PatientPortalController.php:32
 * @route '/api/v1/patient/results'
 */
        resultsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: results.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    results.form = resultsForm
const patient = {
    orders: Object.assign(orders, orders),
results: Object.assign(results, results),
}

export default patient
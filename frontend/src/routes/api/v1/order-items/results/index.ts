import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:44
 * @route '/api/v1/order-items/{orderItem}/result'
 */
export const store = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/order-items/{orderItem}/result',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:44
 * @route '/api/v1/order-items/{orderItem}/result'
 */
store.url = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { orderItem: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { orderItem: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    orderItem: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        orderItem: typeof args.orderItem === 'object'
                ? args.orderItem.id
                : args.orderItem,
                }

    return store.definition.url
            .replace('{orderItem}', parsedArgs.orderItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:44
 * @route '/api/v1/order-items/{orderItem}/result'
 */
store.post = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:44
 * @route '/api/v1/order-items/{orderItem}/result'
 */
    const storeForm = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:44
 * @route '/api/v1/order-items/{orderItem}/result'
 */
        storeForm.post = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const results = {
    store: Object.assign(store, store),
}

export default results
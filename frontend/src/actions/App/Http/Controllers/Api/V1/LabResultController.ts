import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/results',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:22
 * @route '/api/v1/results'
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
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:42
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
 * @see app/Http/Controllers/Api/V1/LabResultController.php:42
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
 * @see app/Http/Controllers/Api/V1/LabResultController.php:42
 * @route '/api/v1/order-items/{orderItem}/result'
 */
store.post = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:42
 * @route '/api/v1/order-items/{orderItem}/result'
 */
    const storeForm = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::store
 * @see app/Http/Controllers/Api/V1/LabResultController.php:42
 * @route '/api/v1/order-items/{orderItem}/result'
 */
        storeForm.post = (args: { orderItem: string | number | { id: string | number } } | [orderItem: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
export const revisions = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: revisions.url(args, options),
    method: 'get',
})

revisions.definition = {
    methods: ["get","head"],
    url: '/api/v1/results/{result}/revisions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
revisions.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return revisions.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
revisions.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: revisions.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
revisions.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: revisions.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
    const revisionsForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: revisions.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
        revisionsForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: revisions.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::revisions
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
        revisionsForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: revisions.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    revisions.form = revisionsForm
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::correct
 * @see app/Http/Controllers/Api/V1/LabResultController.php:73
 * @route '/api/v1/results/{result}/corrections'
 */
export const correct = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: correct.url(args, options),
    method: 'post',
})

correct.definition = {
    methods: ["post"],
    url: '/api/v1/results/{result}/corrections',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::correct
 * @see app/Http/Controllers/Api/V1/LabResultController.php:73
 * @route '/api/v1/results/{result}/corrections'
 */
correct.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return correct.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::correct
 * @see app/Http/Controllers/Api/V1/LabResultController.php:73
 * @route '/api/v1/results/{result}/corrections'
 */
correct.post = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: correct.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::correct
 * @see app/Http/Controllers/Api/V1/LabResultController.php:73
 * @route '/api/v1/results/{result}/corrections'
 */
    const correctForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: correct.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::correct
 * @see app/Http/Controllers/Api/V1/LabResultController.php:73
 * @route '/api/v1/results/{result}/corrections'
 */
        correctForm.post = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: correct.url(args, options),
            method: 'post',
        })
    
    correct.form = correctForm
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:60
 * @route '/api/v1/results/{result}/approval'
 */
export const approve = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/v1/results/{result}/approval',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:60
 * @route '/api/v1/results/{result}/approval'
 */
approve.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return approve.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:60
 * @route '/api/v1/results/{result}/approval'
 */
approve.post = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:60
 * @route '/api/v1/results/{result}/approval'
 */
    const approveForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:60
 * @route '/api/v1/results/{result}/approval'
 */
        approveForm.post = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
const LabResultController = { index, store, revisions, correct, approve }

export default LabResultController
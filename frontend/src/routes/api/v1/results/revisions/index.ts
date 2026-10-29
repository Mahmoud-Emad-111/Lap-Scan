import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
export const index = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/results/{result}/revisions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
index.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
index.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
index.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
    const indexForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
        indexForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:87
 * @route '/api/v1/results/{result}/revisions'
 */
        indexForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
const revisions = {
    index: Object.assign(index, index),
}

export default revisions
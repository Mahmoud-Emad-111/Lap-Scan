import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
import revisions from './revisions'
import corrections from './corrections'
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
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
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
 * @route '/api/v1/results'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
 * @route '/api/v1/results'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
 * @route '/api/v1/results'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
 * @route '/api/v1/results'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
 * @route '/api/v1/results'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::index
 * @see app/Http/Controllers/Api/V1/LabResultController.php:24
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
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
export const document = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})

document.definition = {
    methods: ["get","head"],
    url: '/api/v1/results/{result}/document',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
document.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return document.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
document.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
document.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: document.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
    const documentForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: document.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
        documentForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: document.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::document
 * @see app/Http/Controllers/Api/V1/LabResultController.php:67
 * @route '/api/v1/results/{result}/document'
 */
        documentForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: document.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    document.form = documentForm
/**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:84
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
 * @see app/Http/Controllers/Api/V1/LabResultController.php:84
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
 * @see app/Http/Controllers/Api/V1/LabResultController.php:84
 * @route '/api/v1/results/{result}/approval'
 */
approve.post = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:84
 * @route '/api/v1/results/{result}/approval'
 */
    const approveForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\LabResultController::approve
 * @see app/Http/Controllers/Api/V1/LabResultController.php:84
 * @route '/api/v1/results/{result}/approval'
 */
        approveForm.post = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
const results = {
    index: Object.assign(index, index),
document: Object.assign(document, document),
revisions: Object.assign(revisions, revisions),
corrections: Object.assign(corrections, corrections),
approve: Object.assign(approve, approve),
}

export default results
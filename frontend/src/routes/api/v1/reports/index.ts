import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
export const operations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operations.url(options),
    method: 'get',
})

operations.definition = {
    methods: ["get","head"],
    url: '/api/v1/reports/operations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
operations.url = (options?: RouteQueryOptions) => {
    return operations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
operations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: operations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
operations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: operations.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
    const operationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: operations.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
        operationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operations.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
        operationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: operations.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    operations.form = operationsForm
const reports = {
    operations: Object.assign(operations, operations),
}

export default reports
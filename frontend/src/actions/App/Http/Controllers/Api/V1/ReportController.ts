import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
const ReportController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ReportController.url(options),
    method: 'get',
})

ReportController.definition = {
    methods: ["get","head"],
    url: '/api/v1/reports/operations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
ReportController.url = (options?: RouteQueryOptions) => {
    return ReportController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
ReportController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ReportController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
ReportController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ReportController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
    const ReportControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: ReportController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
        ReportControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ReportController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ReportController::__invoke
 * @see app/Http/Controllers/Api/V1/ReportController.php:18
 * @route '/api/v1/reports/operations'
 */
        ReportControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ReportController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    ReportController.form = ReportControllerForm
export default ReportController
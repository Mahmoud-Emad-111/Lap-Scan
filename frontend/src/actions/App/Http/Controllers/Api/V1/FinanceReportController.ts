import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
const FinanceReportController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: FinanceReportController.url(options),
    method: 'get',
})

FinanceReportController.definition = {
    methods: ["get","head"],
    url: '/api/v1/reports/finance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
FinanceReportController.url = (options?: RouteQueryOptions) => {
    return FinanceReportController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
FinanceReportController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: FinanceReportController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
FinanceReportController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: FinanceReportController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
    const FinanceReportControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: FinanceReportController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
        FinanceReportControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: FinanceReportController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\FinanceReportController::__invoke
 * @see app/Http/Controllers/Api/V1/FinanceReportController.php:14
 * @route '/api/v1/reports/finance'
 */
        FinanceReportControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: FinanceReportController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    FinanceReportController.form = FinanceReportControllerForm
export default FinanceReportController
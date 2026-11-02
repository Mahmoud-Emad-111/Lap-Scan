import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
* @see app/Http/Controllers/Api/V1/DashboardController.php:20
* @route '/api/v1/dashboard'
*/
const DashboardController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardController.url(options),
    method: 'get',
})

DashboardController.definition = {
    methods: ["get","head"],
    url: '/api/v1/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
* @see app/Http/Controllers/Api/V1/DashboardController.php:20
* @route '/api/v1/dashboard'
*/
DashboardController.url = (options?: RouteQueryOptions) => {
    return DashboardController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
* @see app/Http/Controllers/Api/V1/DashboardController.php:20
* @route '/api/v1/dashboard'
*/
DashboardController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DashboardController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
* @see app/Http/Controllers/Api/V1/DashboardController.php:20
* @route '/api/v1/dashboard'
*/
DashboardController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DashboardController.url(options),
    method: 'head',
})

export default DashboardController
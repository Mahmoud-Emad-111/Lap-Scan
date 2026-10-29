import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/tests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
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
const tests = {
    index: Object.assign(index, index),
}

export default tests
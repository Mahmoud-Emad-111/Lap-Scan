import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/patients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
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
const patients = {
    index: Object.assign(index, index),
}

export default patients
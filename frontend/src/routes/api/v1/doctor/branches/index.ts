import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
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
const branches = {
    index: Object.assign(index, index),
}

export default branches
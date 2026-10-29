import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
import verification from './verification'
/**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctors',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorController::index
 * @see app/Http/Controllers/Api/V1/DoctorController.php:17
 * @route '/api/v1/doctors'
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
const doctors = {
    index: Object.assign(index, index),
verification: Object.assign(verification, verification),
}

export default doctors
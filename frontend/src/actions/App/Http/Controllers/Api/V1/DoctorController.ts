import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
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
/**
* @see \App\Http\Controllers\Api\V1\DoctorController::updateVerification
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
export const updateVerification = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateVerification.url(args, options),
    method: 'patch',
})

updateVerification.definition = {
    methods: ["patch"],
    url: '/api/v1/doctors/{doctor}/verification',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorController::updateVerification
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
updateVerification.url = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { doctor: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { doctor: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    doctor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        doctor: typeof args.doctor === 'object'
                ? args.doctor.id
                : args.doctor,
                }

    return updateVerification.definition.url
            .replace('{doctor}', parsedArgs.doctor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorController::updateVerification
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
updateVerification.patch = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateVerification.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorController::updateVerification
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
    const updateVerificationForm = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateVerification.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorController::updateVerification
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
        updateVerificationForm.patch = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateVerification.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateVerification.form = updateVerificationForm
const DoctorController = { index, updateVerification }

export default DoctorController
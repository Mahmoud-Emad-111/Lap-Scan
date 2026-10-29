import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorController::update
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
export const update = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/v1/doctors/{doctor}/verification',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorController::update
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
update.url = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{doctor}', parsedArgs.doctor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorController::update
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
update.patch = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorController::update
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
    const updateForm = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorController::update
 * @see app/Http/Controllers/Api/V1/DoctorController.php:31
 * @route '/api/v1/doctors/{doctor}/verification'
 */
        updateForm.patch = (args: { doctor: number | { id: number } } | [doctor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const verification = {
    update: Object.assign(update, update),
}

export default verification
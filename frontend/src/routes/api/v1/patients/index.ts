import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/patients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\PatientController::index
 * @see app/Http/Controllers/Api/V1/PatientController.php:16
 * @route '/api/v1/patients'
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
* @see \App\Http\Controllers\Api\V1\PatientController::store
 * @see app/Http/Controllers/Api/V1/PatientController.php:25
 * @route '/api/v1/patients'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/patients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientController::store
 * @see app/Http/Controllers/Api/V1/PatientController.php:25
 * @route '/api/v1/patients'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientController::store
 * @see app/Http/Controllers/Api/V1/PatientController.php:25
 * @route '/api/v1/patients'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\PatientController::store
 * @see app/Http/Controllers/Api/V1/PatientController.php:25
 * @route '/api/v1/patients'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\PatientController::store
 * @see app/Http/Controllers/Api/V1/PatientController.php:25
 * @route '/api/v1/patients'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
export const show = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/patients/{patient}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
show.url = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patient: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { patient: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    patient: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return show.definition.url
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
show.get = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
show.head = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
    const showForm = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
        showForm.get = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\PatientController::show
 * @see app/Http/Controllers/Api/V1/PatientController.php:32
 * @route '/api/v1/patients/{patient}'
 */
        showForm.head = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
export const update = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/patients/{patient}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
update.url = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patient: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { patient: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    patient: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        patient: typeof args.patient === 'object'
                ? args.patient.id
                : args.patient,
                }

    return update.definition.url
            .replace('{patient}', parsedArgs.patient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
update.put = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
update.patch = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
    const updateForm = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
        updateForm.put = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\V1\PatientController::update
 * @see app/Http/Controllers/Api/V1/PatientController.php:39
 * @route '/api/v1/patients/{patient}'
 */
        updateForm.patch = (args: { patient: string | number | { id: string | number } } | [patient: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const patients = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
}

export default patients
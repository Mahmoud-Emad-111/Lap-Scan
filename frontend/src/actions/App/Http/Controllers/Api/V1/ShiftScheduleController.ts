import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/shift-schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::index
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:16
 * @route '/api/v1/shift-schedules'
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
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::store
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:30
 * @route '/api/v1/shift-schedules'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/shift-schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::store
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:30
 * @route '/api/v1/shift-schedules'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::store
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:30
 * @route '/api/v1/shift-schedules'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::store
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:30
 * @route '/api/v1/shift-schedules'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::store
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:30
 * @route '/api/v1/shift-schedules'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
export const update = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/shift-schedules/{shiftSchedule}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
update.url = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shiftSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { shiftSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    shiftSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shiftSchedule: typeof args.shiftSchedule === 'object'
                ? args.shiftSchedule.id
                : args.shiftSchedule,
                }

    return update.definition.url
            .replace('{shiftSchedule}', parsedArgs.shiftSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
update.put = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
update.patch = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
    const updateForm = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
        updateForm.put = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ShiftScheduleController::update
 * @see app/Http/Controllers/Api/V1/ShiftScheduleController.php:42
 * @route '/api/v1/shift-schedules/{shiftSchedule}'
 */
        updateForm.patch = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const ShiftScheduleController = { index, store, update }

export default ShiftScheduleController
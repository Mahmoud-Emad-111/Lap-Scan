import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/shifts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::index
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:18
 * @route '/api/v1/shifts'
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
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockIn
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:80
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-in'
 */
export const clockIn = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clockIn.url(args, options),
    method: 'post',
})

clockIn.definition = {
    methods: ["post"],
    url: '/api/v1/shift-schedules/{shiftSchedule}/clock-in',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockIn
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:80
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-in'
 */
clockIn.url = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return clockIn.definition.url
            .replace('{shiftSchedule}', parsedArgs.shiftSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockIn
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:80
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-in'
 */
clockIn.post = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clockIn.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockIn
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:80
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-in'
 */
    const clockInForm = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clockIn.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockIn
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:80
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-in'
 */
        clockInForm.post = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clockIn.url(args, options),
            method: 'post',
        })
    
    clockIn.form = clockInForm
/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockOut
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:95
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-out'
 */
export const clockOut = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clockOut.url(args, options),
    method: 'post',
})

clockOut.definition = {
    methods: ["post"],
    url: '/api/v1/shift-schedules/{shiftSchedule}/clock-out',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockOut
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:95
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-out'
 */
clockOut.url = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return clockOut.definition.url
            .replace('{shiftSchedule}', parsedArgs.shiftSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockOut
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:95
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-out'
 */
clockOut.post = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clockOut.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockOut
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:95
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-out'
 */
    const clockOutForm = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clockOut.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ShiftAttendanceController::clockOut
 * @see app/Http/Controllers/Api/V1/ShiftAttendanceController.php:95
 * @route '/api/v1/shift-schedules/{shiftSchedule}/clock-out'
 */
        clockOutForm.post = (args: { shiftSchedule: string | number | { id: string | number } } | [shiftSchedule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clockOut.url(args, options),
            method: 'post',
        })
    
    clockOut.form = clockOutForm
const ShiftAttendanceController = { index, clockIn, clockOut }

export default ShiftAttendanceController
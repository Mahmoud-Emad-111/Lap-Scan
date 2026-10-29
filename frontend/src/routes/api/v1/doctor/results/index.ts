import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
export const show = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/results/{result}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
show.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return show.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
show.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
show.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
    const showForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
        showForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
        showForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
export const pdf = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})

pdf.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/results/{result}/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
pdf.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return pdf.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
pdf.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
pdf.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
    const pdfForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
        pdfForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::pdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
        pdfForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pdf.form = pdfForm
const results = {
    show: Object.assign(show, show),
pdf: Object.assign(pdf, pdf),
}

export default results
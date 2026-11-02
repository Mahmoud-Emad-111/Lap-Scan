import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\SampleController::index
* @see app/Http/Controllers/Api/V1/SampleController.php:16
* @route '/api/v1/samples'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/samples',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\SampleController::index
* @see app/Http/Controllers/Api/V1/SampleController.php:16
* @route '/api/v1/samples'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\SampleController::index
* @see app/Http/Controllers/Api/V1/SampleController.php:16
* @route '/api/v1/samples'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\SampleController::index
* @see app/Http/Controllers/Api/V1/SampleController.php:16
* @route '/api/v1/samples'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\SampleController::show
* @see app/Http/Controllers/Api/V1/SampleController.php:50
* @route '/api/v1/samples/{sample}'
*/
export const show = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/samples/{sample}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\SampleController::show
* @see app/Http/Controllers/Api/V1/SampleController.php:50
* @route '/api/v1/samples/{sample}'
*/
show.url = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sample: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sample: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sample: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sample: typeof args.sample === 'object'
        ? args.sample.id
        : args.sample,
    }

    return show.definition.url
            .replace('{sample}', parsedArgs.sample.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\SampleController::show
* @see app/Http/Controllers/Api/V1/SampleController.php:50
* @route '/api/v1/samples/{sample}'
*/
show.get = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\SampleController::show
* @see app/Http/Controllers/Api/V1/SampleController.php:50
* @route '/api/v1/samples/{sample}'
*/
show.head = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\SampleController::collect
* @see app/Http/Controllers/Api/V1/SampleController.php:36
* @route '/api/v1/samples/{sample}/collection'
*/
export const collect = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: collect.url(args, options),
    method: 'post',
})

collect.definition = {
    methods: ["post"],
    url: '/api/v1/samples/{sample}/collection',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\SampleController::collect
* @see app/Http/Controllers/Api/V1/SampleController.php:36
* @route '/api/v1/samples/{sample}/collection'
*/
collect.url = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sample: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sample: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sample: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sample: typeof args.sample === 'object'
        ? args.sample.id
        : args.sample,
    }

    return collect.definition.url
            .replace('{sample}', parsedArgs.sample.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\SampleController::collect
* @see app/Http/Controllers/Api/V1/SampleController.php:36
* @route '/api/v1/samples/{sample}/collection'
*/
collect.post = (args: { sample: number | { id: number } } | [sample: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: collect.url(args, options),
    method: 'post',
})

const SampleController = { index, show, collect }

export default SampleController
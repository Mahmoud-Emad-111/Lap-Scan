import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::show
* @see app/Http/Controllers/Api/V1/AppSettingController.php:12
* @route '/api/v1/settings'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::update
* @see app/Http/Controllers/Api/V1/AppSettingController.php:21
* @route '/api/v1/settings'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/v1/settings',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::update
* @see app/Http/Controllers/Api/V1/AppSettingController.php:21
* @route '/api/v1/settings'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::update
* @see app/Http/Controllers/Api/V1/AppSettingController.php:21
* @route '/api/v1/settings'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::update
* @see app/Http/Controllers/Api/V1/AppSettingController.php:21
* @route '/api/v1/settings'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AppSettingController::update
* @see app/Http/Controllers/Api/V1/AppSettingController.php:21
* @route '/api/v1/settings'
*/
updateForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const settings = {
    show: Object.assign(show, show),
    update: Object.assign(update, update),
}

export default settings
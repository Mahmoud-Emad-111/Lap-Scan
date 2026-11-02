import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
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

const settings = {
    show: Object.assign(show, show),
    update: Object.assign(update, update),
}

export default settings
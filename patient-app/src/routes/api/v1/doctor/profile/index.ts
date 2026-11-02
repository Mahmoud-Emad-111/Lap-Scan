import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::show
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:16
* @route '/api/v1/doctor/profile'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::show
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:16
* @route '/api/v1/doctor/profile'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::show
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:16
* @route '/api/v1/doctor/profile'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::show
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:16
* @route '/api/v1/doctor/profile'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::update
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:23
* @route '/api/v1/doctor/profile'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/v1/doctor/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::update
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:23
* @route '/api/v1/doctor/profile'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorProfileController::update
* @see app/Http/Controllers/Api/V1/DoctorProfileController.php:23
* @route '/api/v1/doctor/profile'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

const profile = {
    show: Object.assign(show, show),
    update: Object.assign(update, update),
}

export default profile
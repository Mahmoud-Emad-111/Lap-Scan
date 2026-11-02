import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
import promotions from './promotions'
import referrals from './referrals'
import homeCollections from './home-collections'
import addresses from './addresses'
/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:25
* @route '/api/v1/patient/orders'
*/
export const orders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

orders.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:25
* @route '/api/v1/patient/orders'
*/
orders.url = (options?: RouteQueryOptions) => {
    return orders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:25
* @route '/api/v1/patient/orders'
*/
orders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: orders.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::orders
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:25
* @route '/api/v1/patient/orders'
*/
orders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: orders.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:84
* @route '/api/v1/patient/results'
*/
export const results = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: results.url(options),
    method: 'get',
})

results.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/results',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:84
* @route '/api/v1/patient/results'
*/
results.url = (options?: RouteQueryOptions) => {
    return results.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:84
* @route '/api/v1/patient/results'
*/
results.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: results.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::results
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:84
* @route '/api/v1/patient/results'
*/
results.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: results.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::profile
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:53
* @route '/api/v1/patient/profile'
*/
export const profile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

profile.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::profile
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:53
* @route '/api/v1/patient/profile'
*/
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::profile
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:53
* @route '/api/v1/patient/profile'
*/
profile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::profile
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:53
* @route '/api/v1/patient/profile'
*/
profile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: profile.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::branches
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:40
* @route '/api/v1/patient/branches'
*/
export const branches = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})

branches.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::branches
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:40
* @route '/api/v1/patient/branches'
*/
branches.url = (options?: RouteQueryOptions) => {
    return branches.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::branches
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:40
* @route '/api/v1/patient/branches'
*/
branches.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::branches
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:40
* @route '/api/v1/patient/branches'
*/
branches.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branches.url(options),
    method: 'head',
})

const patient = {
    orders: Object.assign(orders, orders),
    results: Object.assign(results, results),
    profile: Object.assign(profile, profile),
    branches: Object.assign(branches, branches),
    promotions: Object.assign(promotions, promotions),
    referrals: Object.assign(referrals, referrals),
    homeCollections: Object.assign(homeCollections, homeCollections),
    addresses: Object.assign(addresses, addresses),
}

export default patient
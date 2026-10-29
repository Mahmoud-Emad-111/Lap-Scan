import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import branches from './branches'
import patients from './patients'
import tests from './tests'
import users from './users'
import orders from './orders'
import referralDiscountRules from './referral-discount-rules'
import doctors from './doctors'
import doctor from './doctor'
import samples from './samples'
import results from './results'
import orderItems from './order-items'
import reports from './reports'
import patient from './patient'
/**
* @see \App\Http\Controllers\Api\V1\AuthController::login
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/v1/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::login
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::login
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\AuthController::login
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\AuthController::login
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
export const me = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

me.definition = {
    methods: ["get","head"],
    url: '/api/v1/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
me.url = (options?: RouteQueryOptions) => {
    return me.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
me.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
me.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: me.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
    const meForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: me.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
        meForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: me.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\AuthController::me
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
        meForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: me.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    me.form = meForm
/**
* @see \App\Http\Controllers\Api\V1\AuthController::logout
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: logout.url(options),
    method: 'delete',
})

logout.definition = {
    methods: ["delete"],
    url: '/api/v1/logout',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::logout
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::logout
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
logout.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: logout.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\V1\AuthController::logout
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\AuthController::logout
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
        logoutForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/api/v1/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DashboardController::__invoke
 * @see app/Http/Controllers/Api/V1/DashboardController.php:20
 * @route '/api/v1/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
const v1 = {
    login: Object.assign(login, login),
me: Object.assign(me, me),
logout: Object.assign(logout, logout),
branches: Object.assign(branches, branches),
patients: Object.assign(patients, patients),
tests: Object.assign(tests, tests),
dashboard: Object.assign(dashboard, dashboard),
users: Object.assign(users, users),
orders: Object.assign(orders, orders),
referralDiscountRules: Object.assign(referralDiscountRules, referralDiscountRules),
doctors: Object.assign(doctors, doctors),
doctor: Object.assign(doctor, doctor),
samples: Object.assign(samples, samples),
results: Object.assign(results, results),
orderItems: Object.assign(orderItems, orderItems),
reports: Object.assign(reports, reports),
patient: Object.assign(patient, patient),
}

export default v1
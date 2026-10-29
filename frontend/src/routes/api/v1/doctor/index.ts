import profile from './profile'
import branches from './branches'
import tests from './tests'
import patients from './patients'
import orders from './orders'
import results from './results'
const doctor = {
    profile: Object.assign(profile, profile),
branches: Object.assign(branches, branches),
tests: Object.assign(tests, tests),
patients: Object.assign(patients, patients),
orders: Object.assign(orders, orders),
results: Object.assign(results, results),
}

export default doctor
import AuthController from './AuthController'
import BranchController from './BranchController'
import PatientController from './PatientController'
import TestController from './TestController'
import DashboardController from './DashboardController'
import UserController from './UserController'
import OrderController from './OrderController'
import ReferralDiscountRuleController from './ReferralDiscountRuleController'
import DoctorController from './DoctorController'
import DoctorProfileController from './DoctorProfileController'
import DoctorPortalController from './DoctorPortalController'
import SampleController from './SampleController'
import LabResultController from './LabResultController'
import ReportController from './ReportController'
import PatientPortalController from './PatientPortalController'
const V1 = {
    AuthController: Object.assign(AuthController, AuthController),
BranchController: Object.assign(BranchController, BranchController),
PatientController: Object.assign(PatientController, PatientController),
TestController: Object.assign(TestController, TestController),
DashboardController: Object.assign(DashboardController, DashboardController),
UserController: Object.assign(UserController, UserController),
OrderController: Object.assign(OrderController, OrderController),
ReferralDiscountRuleController: Object.assign(ReferralDiscountRuleController, ReferralDiscountRuleController),
DoctorController: Object.assign(DoctorController, DoctorController),
DoctorProfileController: Object.assign(DoctorProfileController, DoctorProfileController),
DoctorPortalController: Object.assign(DoctorPortalController, DoctorPortalController),
SampleController: Object.assign(SampleController, SampleController),
LabResultController: Object.assign(LabResultController, LabResultController),
ReportController: Object.assign(ReportController, ReportController),
PatientPortalController: Object.assign(PatientPortalController, PatientPortalController),
}

export default V1
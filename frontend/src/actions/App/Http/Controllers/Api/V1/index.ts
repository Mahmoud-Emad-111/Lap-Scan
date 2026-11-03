import AuthController from './AuthController'
import PushTokenController from './PushTokenController'
import BranchController from './BranchController'
import PatientController from './PatientController'
import TestController from './TestController'
import DashboardController from './DashboardController'
import AppSettingController from './AppSettingController'
import UserController from './UserController'
import OrderController from './OrderController'
import OrderPaymentController from './OrderPaymentController'
import FinanceReportController from './FinanceReportController'
import ShiftScheduleController from './ShiftScheduleController'
import ShiftAttendanceController from './ShiftAttendanceController'
import ReferralDiscountRuleController from './ReferralDiscountRuleController'
import PatientPromotionController from './PatientPromotionController'
import DoctorController from './DoctorController'
import DoctorProfileController from './DoctorProfileController'
import DoctorPortalController from './DoctorPortalController'
import SampleController from './SampleController'
import LabResultController from './LabResultController'
import ReportController from './ReportController'
import PatientPortalController from './PatientPortalController'
import PatientReferralController from './PatientReferralController'
import PatientAddressController from './PatientAddressController'

const V1 = {
    AuthController: Object.assign(AuthController, AuthController),
    PushTokenController: Object.assign(PushTokenController, PushTokenController),
    BranchController: Object.assign(BranchController, BranchController),
    PatientController: Object.assign(PatientController, PatientController),
    TestController: Object.assign(TestController, TestController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    AppSettingController: Object.assign(AppSettingController, AppSettingController),
    UserController: Object.assign(UserController, UserController),
    OrderController: Object.assign(OrderController, OrderController),
    OrderPaymentController: Object.assign(OrderPaymentController, OrderPaymentController),
    FinanceReportController: Object.assign(FinanceReportController, FinanceReportController),
    ShiftScheduleController: Object.assign(ShiftScheduleController, ShiftScheduleController),
    ShiftAttendanceController: Object.assign(ShiftAttendanceController, ShiftAttendanceController),
    ReferralDiscountRuleController: Object.assign(ReferralDiscountRuleController, ReferralDiscountRuleController),
    PatientPromotionController: Object.assign(PatientPromotionController, PatientPromotionController),
    DoctorController: Object.assign(DoctorController, DoctorController),
    DoctorProfileController: Object.assign(DoctorProfileController, DoctorProfileController),
    DoctorPortalController: Object.assign(DoctorPortalController, DoctorPortalController),
    SampleController: Object.assign(SampleController, SampleController),
    LabResultController: Object.assign(LabResultController, LabResultController),
    ReportController: Object.assign(ReportController, ReportController),
    PatientPortalController: Object.assign(PatientPortalController, PatientPortalController),
    PatientReferralController: Object.assign(PatientReferralController, PatientReferralController),
    PatientAddressController: Object.assign(PatientAddressController, PatientAddressController),
}

export default V1
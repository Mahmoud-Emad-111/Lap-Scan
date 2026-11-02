import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '@/components/ui/notification-provider';
import { ApiError } from '@/lib/api-client';
import type { ApiPage } from '@/types/api';
import type { PortalSection } from '@/app/routes';
import type { CatalogEditor } from '@/modules/laboratory/components/CatalogEditorDialog';
import {
    fetchBranches,
    fetchDashboardSummary,
    fetchPatients,
    fetchTests,
    saveBranch,
    savePatient,
    saveTest,
} from '@/modules/laboratory/services/laboratoryApi';
import type {
    Branch,
    BranchPayload,
    DashboardSummary,
    LabTest,
    LabTestPayload,
    Patient,
    PatientPayload,
} from '@/modules/laboratory/types';

type CatalogSection = Extract<PortalSection, 'patients' | 'tests' | 'branches'>;
type CatalogRecord = Patient | LabTest | Branch;

type UseLaboratoryCatalogOptions = {
    token: string | null;
    section: PortalSection;
    canAccessSection: boolean;
    canManagePatients: boolean;
};

export function useLaboratoryCatalog({
    token,
    section,
    canAccessSection,
    canManagePatients,
}: UseLaboratoryCatalogOptions) {
    const { showSuccessNotice } = useNotifications();
    const [patients, setPatients] = useState<ApiPage<Patient> | null>(null);
    const [tests, setTests] = useState<ApiPage<LabTest> | null>(null);
    const [branches, setBranches] = useState<ApiPage<Branch> | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [editor, setEditor] = useState<CatalogEditor | null>(null);
    const [editorErrors, setEditorErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [busy, setBusy] = useState(false);

    const loadPage = useCallback(
        async (kind: CatalogSection, url?: string) => {
            if (!token) {
                return null;
            }

            if (kind === 'patients') {
                const response = await fetchPatients(token, url);
                setPatients(response);

                return response;
            }

            if (kind === 'tests') {
                const response = await fetchTests(token, url);
                setTests(response);

                return response;
            }

            const response = await fetchBranches(token, url);
            setBranches(response);

            return response;
        },
        [token],
    );

    const loadOverview = useCallback(async () => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError('');

        const requests: Promise<unknown>[] = [
            loadPage('tests'),
            fetchDashboardSummary(token).then(setSummary),
        ];

        if (canManagePatients) {
            requests.push(loadPage('patients'));
            requests.push(loadPage('branches'));
        }

        const results = await Promise.allSettled(requests);
        const failed = results.find(
            (result): result is PromiseRejectedResult =>
                result.status === 'rejected',
        );

        if (failed) {
            setError(
                failed.reason instanceof Error
                    ? failed.reason.message
                    : 'تعذّر تحميل بيانات لوحة التحكم.',
            );
        }

        setLoading(false);
    }, [canManagePatients, loadPage, token]);

    const loadSection = useCallback(
        async (nextSection: PortalSection, url?: string) => {
            setQuery('');
            setError('');
            setLoading(true);

            try {
                if (isCatalogSection(nextSection)) {
                    await loadPage(nextSection, url);
                }
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر تحميل البيانات.',
                );
            } finally {
                setLoading(false);
            }
        },
        [loadPage],
    );

    useEffect(() => {
        if (token && section === 'overview') {
            void loadOverview();
        }
    }, [loadOverview, section, token]);

    useEffect(() => {
        if (token && canAccessSection && isCatalogSection(section)) {
            void loadSection(section);
        }
    }, [canAccessSection, loadSection, section, token]);

    useEffect(() => {
        if (token) {
            return;
        }

        setPatients(null);
        setTests(null);
        setBranches(null);
        setSummary(null);
        setQuery('');
        setError('');
        setEditor(null);
        setEditorErrors({});
    }, [token]);

    function openEditor(kind: CatalogEditor['kind'], record?: CatalogRecord) {
        setEditorErrors({});

        if (kind === 'patient') {
            const patient =
                record && 'full_name' in record ? record : undefined;
            setEditor({
                kind,
                id: patient?.id,
                values: {
                    full_name: patient?.full_name ?? '',
                    phone: patient?.phone ?? '',
                    email: patient?.email ?? '',
                    date_of_birth: patient?.date_of_birth ?? '',
                    gender: patient?.gender ?? '',
                },
            });

            return;
        }

        if (kind === 'test') {
            const test =
                record && 'specimen_type' in record ? record : undefined;
            setEditor({
                kind,
                id: test?.id,
                values: {
                    code: test?.code ?? '',
                    name: test?.name ?? '',
                    description: test?.description ?? '',
                    specimen_type: test?.specimen_type ?? '',
                    price: test?.price ?? '',
                    turnaround_time_minutes: String(
                        test?.turnaround_time_minutes ?? 60,
                    ),
                    is_active: test?.is_active ?? true,
                },
            });

            return;
        }

        const branch = record && 'is_default' in record ? record : undefined;
        setEditor({
            kind,
            id: branch?.id,
            values: {
                name: branch?.name ?? '',
                code: branch?.code ?? '',
                address: branch?.address ?? '',
                phone: branch?.phone ?? '',
                is_active: branch?.is_active ?? true,
                is_default: branch?.is_default ?? false,
            },
        });
    }

    async function saveEditor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editor || !token) {
            return;
        }

        setBusy(true);
        setEditorErrors({});
        setError('');

        try {
            const { kind, id, values } = editor;
            const stringValue = (key: string) => {
                const value = values[key];

                return typeof value === 'string' ? value : '';
            };

            if (kind === 'patient') {
                const payload: PatientPayload = {
                    full_name: stringValue('full_name'),
                    phone: stringValue('phone'),
                    ...(stringValue('email')
                        ? { email: stringValue('email') }
                        : {}),
                    ...(stringValue('date_of_birth')
                        ? { date_of_birth: stringValue('date_of_birth') }
                        : {}),
                    ...(stringValue('gender')
                        ? { gender: stringValue('gender') }
                        : {}),
                };
                await savePatient(token, id, payload);
            } else if (kind === 'test') {
                const payload: LabTestPayload = {
                    code: stringValue('code'),
                    name: stringValue('name'),
                    description: stringValue('description') || null,
                    specimen_type: stringValue('specimen_type'),
                    price: stringValue('price'),
                    turnaround_time_minutes: Number(
                        stringValue('turnaround_time_minutes'),
                    ),
                    is_active: values.is_active === true,
                };
                await saveTest(token, id, payload);
            } else {
                const payload: BranchPayload = {
                    name: stringValue('name'),
                    code: stringValue('code'),
                    address: stringValue('address') || null,
                    phone: stringValue('phone') || null,
                    is_active: values.is_active === true,
                    is_default: values.is_default === true,
                };
                await saveBranch(token, id, payload);
            }

            setEditor(null);
            showSuccessNotice('تم حفظ التغييرات بنجاح.');

            if (section === 'overview') {
                await loadOverview();
            } else {
                await loadSection(section);
            }
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setEditorErrors(requestError.validationErrors);
                setError(
                    Object.keys(requestError.validationErrors).length === 0
                        ? requestError.message
                        : '',
                );
            } else {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر حفظ البيانات.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    const activePage =
        section === 'patients'
            ? patients
            : section === 'tests'
              ? tests
              : section === 'branches'
                ? branches
                : null;

    function editCatalogRecord(record: CatalogRecord) {
        if ('full_name' in record) {
            openEditor('patient', record);
        } else if ('specimen_type' in record) {
            openEditor('test', record);
        } else {
            openEditor('branch', record);
        }
    }

    return {
        patients,
        tests,
        branches,
        summary,
        loading,
        error,
        setError,
        query,
        setQuery,
        editor,
        setEditor,
        editorErrors,
        setEditorErrors,
        busy,
        activePage,
        loadSection,
        openEditor,
        saveEditor,
        editCatalogRecord,
    };
}

function isCatalogSection(section: PortalSection): section is CatalogSection {
    return (
        section === 'patients' || section === 'tests' || section === 'branches'
    );
}

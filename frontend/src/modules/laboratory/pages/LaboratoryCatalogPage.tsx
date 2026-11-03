import { Icon } from '@/components/ui/icon';
import { EmptyState, LoadingRows } from '@/components/ui/feedback';
import { PageShell } from '@/components/laboratory/workflow-ui';
import type { ApiPage } from '@/types/api';
import type { Branch, LabTest, Patient } from '@/modules/laboratory/types';

export type CatalogSection = 'patients' | 'tests' | 'branches';
type CatalogRecord = Patient | LabTest | Branch;
type CatalogPage = ApiPage<Patient> | ApiPage<LabTest> | ApiPage<Branch>;

type LaboratoryCatalogPageProps = {
    section: CatalogSection;
    page: CatalogPage | null;
    query: string;
    loading: boolean;
    canAdd: boolean;
    canEdit: boolean;
    onQueryChange: (query: string) => void;
    onAdd: () => void;
    onEdit: (record: CatalogRecord) => void;
    onPageChange: (url: string) => void;
};

const sectionTitles: Record<CatalogSection, string> = {
    patients: 'المرضى',
    tests: 'كتالوج التحاليل',
    branches: 'الفروع',
};

const sectionIcons: Record<CatalogSection, 'users' | 'beaker' | 'branch'> = {
    patients: 'users',
    tests: 'beaker',
    branches: 'branch',
};

export function LaboratoryCatalogPage({
    section,
    page,
    query,
    loading,
    canAdd,
    canEdit,
    onQueryChange,
    onAdd,
    onEdit,
    onPageChange,
}: LaboratoryCatalogPageProps) {
    const title = sectionTitles[section];
    const rows = page?.data ?? [];
    const filteredRows = rows.filter((record) =>
        JSON.stringify(record)
            .toLocaleLowerCase('ar')
            .includes(query.toLocaleLowerCase('ar')),
    );

    return (
        <PageShell
            title={title}
            description={`إدارة وتحديث بيانات ${title.toLocaleLowerCase('ar')} واستعراض سجلات النظام.`}
            action={
                canAdd ? (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                        <Icon name="plus" size={17} />
                        إضافة{' '}
                        {section === 'patients'
                            ? 'مريض'
                            : section === 'tests'
                              ? 'تحليل'
                              : 'فرع'}
                    </button>
                ) : undefined
            }
        >
            <section className="grid gap-5">
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:flex-row sm:items-center sm:justify-between">
                    <label className="relative w-full sm:max-w-sm">
                        <span className="sr-only">البحث في {title}</span>
                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">
                            <Icon name="search" size={17} />
                        </span>
                        <input
                            value={query}
                            onChange={(event) =>
                                onQueryChange(event.target.value)
                            }
                            placeholder={`بحث في ${title} المعروضة`}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 text-sm transition outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                        />
                    </label>
                    <span className="text-xs text-slate-500">
                        {page
                            ? `إجمالي ${page.meta.total} سجل`
                            : 'لا توجد بيانات محملة'}
                    </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                    {loading ? (
                        <LoadingRows />
                    ) : filteredRows.length === 0 ? (
                        <EmptyState
                            title={
                                query
                                    ? 'لا توجد نتائج مطابقة'
                                    : 'لا توجد سجلات بعد'
                            }
                            description={
                                query
                                    ? 'جرّب تغيير عبارة البحث.'
                                    : 'أضف أول سجل ليظهر هنا.'
                            }
                            icon={sectionIcons[section]}
                        />
                    ) : (
                        <CatalogTable
                            section={section}
                            rows={filteredRows}
                            canEdit={canEdit}
                            onEdit={onEdit}
                        />
                    )}
                </div>

                {page && page.meta.last_page > 1 && (
                    <nav
                        aria-label={`صفحات ${title}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3"
                    >
                        <button
                            type="button"
                            disabled={!page.links.prev || loading}
                            onClick={() => {
                                if (page.links.prev) {
                                    onPageChange(page.links.prev);
                                }
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Icon name="arrow-right" size={16} />
                            السابق
                        </button>
                        <span className="text-xs text-slate-500">
                            صفحة {page.meta.current_page} من{' '}
                            {page.meta.last_page}
                        </span>
                        <button
                            type="button"
                            disabled={!page.links.next || loading}
                            onClick={() => {
                                if (page.links.next) {
                                    onPageChange(page.links.next);
                                }
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            التالي
                            <Icon name="arrow-left" size={16} />
                        </button>
                    </nav>
                )}
            </section>
        </PageShell>
    );
}

function CatalogTable({
    section,
    rows,
    canEdit,
    onEdit,
}: {
    section: CatalogSection;
    rows: CatalogRecord[];
    canEdit: boolean;
    onEdit: (record: CatalogRecord) => void;
}) {
    if (section === 'patients') {
        return (
            <TableShell
                headings={[
                    'اسم المريض',
                    'رقم الهاتف',
                    'البريد الإلكتروني',
                    'تاريخ الميلاد',
                    '',
                ]}
            >
                {rows.filter(isPatient).map((patient) => (
                    <tr key={patient.id}>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                            {patient.full_name}
                        </td>
                        <td className="px-5 py-4 text-slate-600" dir="ltr">
                            {patient.phone}
                        </td>
                        <td className="px-5 py-4 text-slate-500" dir="ltr">
                            {patient.email || '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                            {patient.date_of_birth || '—'}
                        </td>
                        <EditCell
                            canEdit={canEdit}
                            onEdit={() => onEdit(patient)}
                        />
                    </tr>
                ))}
            </TableShell>
        );
    }

    if (section === 'tests') {
        return (
            <TableShell
                headings={[
                    'اسم التحليل',
                    'الكود',
                    'نوع العينة',
                    'السعر',
                    'مدة الإنجاز',
                    '',
                ]}
            >
                {rows.filter(isLabTest).map((test) => (
                    <tr key={test.id}>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                            {test.name}
                            {test.description && (
                                <p className="mt-1 max-w-xs truncate text-xs font-normal text-slate-400">
                                    {test.description}
                                </p>
                            )}
                        </td>
                        <td className="px-5 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {test.code}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                            {test.specimen_type}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                            {formatPrice(test.price)}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                            {new Intl.NumberFormat('ar-EG').format(
                                test.turnaround_time_minutes,
                            )}{' '}
                            دقيقة
                        </td>
                        <EditCell
                            canEdit={canEdit}
                            onEdit={() => onEdit(test)}
                        />
                    </tr>
                ))}
            </TableShell>
        );
    }

    return (
        <TableShell
            headings={['اسم الفرع', 'الكود', 'العنوان', 'الهاتف', 'الحالة', '']}
        >
            {rows.filter(isBranch).map((branch) => (
                <tr key={branch.id}>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                        {branch.name}
                        {branch.is_default && (
                            <span className="mr-2 inline-flex rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">
                                افتراضي
                            </span>
                        )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{branch.code}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-slate-500">
                        {branch.address || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-500" dir="ltr">
                        {branch.phone || '—'}
                    </td>
                    <td className="px-5 py-4">
                        <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${branch.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}
                        >
                            {branch.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                    </td>
                    <EditCell canEdit={canEdit} onEdit={() => onEdit(branch)} />
                </tr>
            ))}
        </TableShell>
    );
}

function TableShell({
    headings,
    children,
}: {
    headings: string[];
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-right text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                    <tr>
                        {headings.map((heading) => (
                            <th
                                key={heading}
                                className="border-b border-slate-200 px-5 py-4"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-brand-50/40">
                    {children}
                </tbody>
            </table>
        </div>
    );
}

function EditCell({
    canEdit,
    onEdit,
}: {
    canEdit: boolean;
    onEdit: () => void;
}) {
    return (
        <td className="px-5 py-4 text-left">
            {canEdit && (
                <button
                    type="button"
                    aria-label="تعديل"
                    onClick={onEdit}
                    className="hover:border-brand-200 grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700"
                >
                    <Icon name="edit" size={16} />
                </button>
            )}
        </td>
    );
}

function isPatient(record: CatalogRecord): record is Patient {
    return 'full_name' in record;
}

function isLabTest(record: CatalogRecord): record is LabTest {
    return 'specimen_type' in record;
}

function isBranch(record: CatalogRecord): record is Branch {
    return 'is_default' in record;
}

function formatPrice(price: string): string {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 2,
    }).format(Number(price));
}

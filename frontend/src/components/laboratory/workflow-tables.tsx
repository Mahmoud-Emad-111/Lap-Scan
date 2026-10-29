import {
    formatPrice,
    roleLabels,
    type OrderItem,
    type WorkflowRow,
    type WorkflowSection,
} from '@/components/laboratory/workflow-types';
import {
    DataTable,
    StatusBadge,
    TableCell,
} from '@/components/laboratory/workflow-ui';

function ActionButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="hover:border-brand-200 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
        >
            {label}
        </button>
    );
}

export function WorkflowTable({
    section,
    rows,
    currentUserId,
    query,
    onEditUser,
    onCollectSample,
    onEditResult,
    onApproveResult,
    onDownloadResultDocument,
}: {
    section: WorkflowSection;
    rows: WorkflowRow[];
    currentUserId: number;
    query: string;
    onEditUser: (user: WorkflowRow) => void;
    onCollectSample: (sampleId: number) => void;
    onEditResult: (item: OrderItem, order: WorkflowRow) => void;
    onApproveResult: (resultId: number) => void;
    onDownloadResultDocument: (resultId: number) => void;
}) {
    if (rows.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-sm leading-6 text-slate-500">
                {query ? 'لا توجد نتائج مطابقة.' : 'لا توجد سجلات لعرضها بعد.'}
            </div>
        );
    }

    if (section === 'users') {
        return (
            <DataTable
                headings={['الاسم', 'البريد الإلكتروني', 'الدور', 'الفروع', '']}
            >
                {rows.map((user) => (
                    <tr key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            {user.role ? roleLabels[user.role] : '—'}
                        </TableCell>
                        <TableCell>
                            {user.branches
                                ?.map((branch) => branch.name)
                                .join('، ') || '—'}
                        </TableCell>
                        <TableCell>
                            {user.id !== currentUserId && (
                                <ActionButton
                                    label="تعديل"
                                    onClick={() => onEditUser(user)}
                                />
                            )}
                        </TableCell>
                    </tr>
                ))}
            </DataTable>
        );
    }

    if (section === 'orders' || section === 'patient-orders') {
        return (
            <DataTable
                headings={[
                    'رقم الطلب',
                    'المريض',
                    'الفرع',
                    'التحاليل',
                    'الحالة',
                    'الأولوية',
                    'الإجمالي',
                    'التاريخ',
                ]}
            >
                {rows.map((order) => (
                    <tr key={order.id}>
                        <TableCell>{order.order_number}</TableCell>
                        <TableCell>
                            {order.patient?.full_name ?? 'حسابي'}
                        </TableCell>
                        <TableCell>{order.branch?.name ?? '—'}</TableCell>
                        <TableCell>
                            {order.items
                                ?.map((item) => item.test_name)
                                .join('، ')}
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                            {order.priority === 'urgent' ? (
                                <span
                                    title={order.urgent_reason ?? ''}
                                    className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
                                >
                                    عاجل
                                </span>
                            ) : (
                                'عادي'
                            )}
                            {order.referring_doctor && (
                                <span className="mt-1 block text-xs text-slate-500">
                                    إحالة: {order.referring_doctor.name}
                                </span>
                            )}
                        </TableCell>
                        <TableCell>
                            {order.total ? (
                                <>
                                    <span className="block font-semibold text-slate-800">
                                        {formatPrice(order.total)}
                                    </span>
                                    {order.discount_amount !== undefined &&
                                        Number(order.discount_amount) > 0 && (
                                            <span className="block text-xs text-emerald-700">
                                                خصم:{' '}
                                                {formatPrice(
                                                    order.discount_amount,
                                                )}
                                                {order.discount?.name
                                                    ? ` · ${order.discount.name}`
                                                    : ''}
                                            </span>
                                        )}
                                </>
                            ) : (
                                '—'
                            )}
                        </TableCell>
                        <TableCell>
                            {order.created_at
                                ? new Date(order.created_at).toLocaleDateString(
                                      'ar-EG',
                                  )
                                : '—'}
                        </TableCell>
                    </tr>
                ))}
            </DataTable>
        );
    }

    if (section === 'samples') {
        return (
            <DataTable
                headings={[
                    'الباركود',
                    'المريض',
                    'التحليل',
                    'نوع العينة',
                    'الحالة',
                    'موعد الاستلام',
                    '',
                ]}
            >
                {rows.map((sample) => (
                    <tr key={sample.id}>
                        <TableCell>{sample.barcode}</TableCell>
                        <TableCell>{sample.patient_name}</TableCell>
                        <TableCell>{sample.test_name}</TableCell>
                        <TableCell>{sample.specimen_type}</TableCell>
                        <TableCell>
                            <StatusBadge status={sample.status} />
                        </TableCell>
                        <TableCell>
                            {sample.collected_at
                                ? new Date(sample.collected_at).toLocaleString(
                                      'ar-EG',
                                  )
                                : '—'}
                        </TableCell>
                        <TableCell>
                            {sample.status === 'pending_collection' && (
                                <ActionButton
                                    label="تسجيل الاستلام"
                                    onClick={() => onCollectSample(sample.id)}
                                />
                            )}
                        </TableCell>
                    </tr>
                ))}
            </DataTable>
        );
    }

    if (section === 'results') {
        const items = rows.flatMap((order) =>
            (order.items ?? []).map((item) => ({ order, item })),
        );

        if (items.length === 0) {
            return (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    لا توجد طلبات أو عينات جاهزة لإدخال النتائج.
                </div>
            );
        }

        return (
            <DataTable
                headings={[
                    'رقم الطلب',
                    'المريض',
                    'التحليل',
                    'العينة',
                    'النتيجة',
                    'الحالة',
                    '',
                ]}
            >
                {items.map(({ order, item }) => {
                    const draftResultId =
                        item.result?.status === 'draft' ? item.result.id : null;
                    const resultId = item.result?.id;
                    const pendingSampleId =
                        item.sample?.status === 'pending_collection'
                            ? item.sample.id
                            : null;

                    return (
                        <tr key={item.id}>
                            <TableCell>{order.order_number}</TableCell>
                            <TableCell>{order.patient?.full_name}</TableCell>
                            <TableCell>{item.test_name}</TableCell>
                            <TableCell>
                                <StatusBadge status={item.sample?.status} />
                            </TableCell>
                            <TableCell>
                                {item.result?.value ?? '—'}{' '}
                                {item.result?.unit ?? ''}
                                {item.result?.has_pdf && (
                                    <span className="mt-1 block text-xs text-slate-500">
                                        تقرير PDF مرفق
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={item.result?.status} />
                            </TableCell>
                            <TableCell>
                                {pendingSampleId !== null ? (
                                    <div className="grid justify-items-start gap-2">
                                        <ActionButton
                                            label="تسجيل استلام العينة"
                                            onClick={() =>
                                                onCollectSample(pendingSampleId)
                                            }
                                        />
                                        <span className="text-xs text-slate-500">
                                            يلزم تسجيل الاستلام قبل إدخال النتيجة.
                                        </span>
                                    </div>
                                ) : item.sample?.status === 'collected' &&
                                  item.result?.status !== 'approved' ? (
                                    <div className="flex gap-2">
                                        <ActionButton
                                            label={
                                                item.result
                                                    ? 'تعديل المسودة'
                                                    : 'إدخال نتيجة'
                                            }
                                            onClick={() =>
                                                onEditResult(item, order)
                                            }
                                        />
                                        {draftResultId !== null && (
                                            <ActionButton
                                                label="اعتماد"
                                                onClick={() =>
                                                    onApproveResult(
                                                        draftResultId,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                ) : item.result?.status === 'approved' ? (
                                    <span className="text-xs text-slate-500">
                                        النتيجة معتمدة ولا يمكن تعديلها.
                                    </span>
                                ) : !item.sample ? (
                                    <span className="text-xs text-slate-500">
                                        لا توجد عينة مرتبطة بهذا التحليل.
                                    </span>
                                ) : null}
                                {item.result?.has_pdf &&
                                    resultId !== undefined && (
                                        <ActionButton
                                            label="تنزيل PDF"
                                            onClick={() =>
                                                onDownloadResultDocument(
                                                    resultId,
                                                )
                                            }
                                        />
                                    )}
                            </TableCell>
                        </tr>
                    );
                })}
            </DataTable>
        );
    }

    return (
        <DataTable
            headings={[
                'رقم الطلب',
                'التحليل',
                'النتيجة',
                'الوحدة',
                'النطاق المرجعي',
                'تاريخ الاعتماد',
            ]}
        >
            {rows.map((result) => (
                <tr key={result.id}>
                    <TableCell>{result.order_number}</TableCell>
                    <TableCell>{result.test_name}</TableCell>
                    <TableCell className="font-semibold">
                        {result.value}
                    </TableCell>
                    <TableCell>{result.unit ?? '—'}</TableCell>
                    <TableCell>{result.reference_range ?? '—'}</TableCell>
                    <TableCell>
                        {result.approved_at
                            ? new Date(result.approved_at).toLocaleDateString(
                                  'ar-EG',
                              )
                            : '—'}
                    </TableCell>
                </tr>
            ))}
        </DataTable>
    );
}

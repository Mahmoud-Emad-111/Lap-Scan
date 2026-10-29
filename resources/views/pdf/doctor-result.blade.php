<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            color: #172a26;
            font-size: 13px;
            line-height: 1.8;
        }

        h1 {
            color: #155e52;
            font-size: 22px;
        }

        .meta {
            margin-bottom: 24px;
            color: #52635f;
        }

        .result {
            border: 1px solid #d5e2de;
            border-radius: 8px;
            padding: 18px;
            margin: 18px 0;
        }
    </style>
</head>
<body>
    <h1>تقرير نتيجة مختبرية</h1>
    <div class="meta">
        <div>الفرع: {{ $branch->name }}</div>
        <div>رقم الطلب: {{ $order->order_number }}</div>
        <div>المريض: {{ $patient->full_name }}</div>
        <div>تاريخ الاعتماد: {{ $result->approved_at?->format('Y-m-d H:i') }}</div>
    </div>
    <div class="result">
        <strong>التحليل:</strong> {{ $testName }}<br>
        <strong>النتيجة:</strong> {{ $result->value }} {{ $result->unit }}<br>
        <strong>المدى المرجعي:</strong> {{ $result->reference_range ?: 'غير محدد' }}<br>
        @if ($result->notes)
            <strong>ملاحظات:</strong> {{ $result->notes }}
        @endif
    </div>
</body>
</html>

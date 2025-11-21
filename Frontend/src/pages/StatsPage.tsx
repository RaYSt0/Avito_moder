import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Segmented,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo, useState } from 'react';
import { fetchActivityChart, fetchCategoriesChart, fetchDecisionsChart, fetchSummaryStats } from '@/api/stats';
import type { StatsPeriod } from '@/types/stats';

const { Title, Text } = Typography;

const periodOptions = [
  { label: 'Сегодня', value: 'today' },
  { label: '7 дней', value: 'week' },
  { label: '30 дней', value: 'month' },
];

const pieColors = ['#16a34a', '#dc2626', '#f97316'];

const MetricCard = ({ title, value, description }: { title: string; value: string; description?: string }) => (
  <Card>
    <Space direction="vertical" size={4}>
      <Text type="secondary">{title}</Text>
      <Title level={3} style={{ margin: 0 }}>
        {value}
      </Title>
      {description && <Text type="secondary">{description}</Text>}
    </Space>
  </Card>
);

export const StatsPage = () => {
  const [period, setPeriod] = useState<StatsPeriod>('week');

  const summaryQuery = useQuery({
    queryKey: ['stats', 'summary', period],
    queryFn: ({ signal }) => fetchSummaryStats(period, signal),
  });

  const activityQuery = useQuery({
    queryKey: ['stats', 'activity', period],
    queryFn: ({ signal }) => fetchActivityChart(period, signal),
  });

  const decisionsQuery = useQuery({
    queryKey: ['stats', 'decisions', period],
    queryFn: ({ signal }) => fetchDecisionsChart(period, signal),
  });

  const categoriesQuery = useQuery({
    queryKey: ['stats', 'categories', period],
    queryFn: ({ signal }) => fetchCategoriesChart(period, signal),
  });

  const isLoading = summaryQuery.isLoading || activityQuery.isLoading || decisionsQuery.isLoading || categoriesQuery.isLoading;
  const hasError = summaryQuery.isError || activityQuery.isError || decisionsQuery.isError || categoriesQuery.isError;

  const categoriesData = useMemo(
    () =>
      categoriesQuery.data
        ? Object.entries(categoriesQuery.data).map(([name, value]) => ({
            name,
            value,
          }))
        : [],
    [categoriesQuery.data],
  );

  const exportToCsv = () => {
    if (!summaryQuery.data || !activityQuery.data || !decisionsQuery.data || categoriesData.length === 0) {
      message.warning('Данные ещё не загрузились');
      return;
    }

    const lines: string[] = [];
    lines.push('Метрика,Значение');
    lines.push(`Всего проверено,${summaryQuery.data.totalReviewed}`);
    lines.push(`Сегодня,${summaryQuery.data.totalReviewedToday}`);
    lines.push(`За неделю,${summaryQuery.data.totalReviewedThisWeek}`);
    lines.push(`За месяц,${summaryQuery.data.totalReviewedThisMonth}`);
    lines.push(`% Одобрено,${summaryQuery.data.approvedPercentage.toFixed(1)}%`);
    lines.push(`% Отклонено,${summaryQuery.data.rejectedPercentage.toFixed(1)}%`);
    lines.push(`% На доработку,${summaryQuery.data.requestChangesPercentage.toFixed(1)}%`);
    lines.push(`Среднее время (сек),${summaryQuery.data.averageReviewTime}`);
    lines.push('');
    lines.push('Активность');
    lines.push('Дата,Одобрено,Отклонено,На доработку');
    activityQuery.data.forEach((point) => {
      lines.push(`${point.date},${point.approved},${point.rejected},${point.requestChanges}`);
    });
    lines.push('');
    lines.push('Решения');
    lines.push('Тип,Процент');
    lines.push(`Одобрено,${decisionsQuery.data.approved.toFixed(1)}%`);
    lines.push(`Отклонено,${decisionsQuery.data.rejected.toFixed(1)}%`);
    lines.push(`На доработку,${decisionsQuery.data.requestChanges.toFixed(1)}%`);
    lines.push('');
    lines.push('Категории');
    lines.push('Категория,Количество');
    categoriesData.forEach((item) => {
      lines.push(`${item.name},${item.value}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stats-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Flex justify="center" style={{ padding: '80px 0' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (hasError || !summaryQuery.data || !activityQuery.data || !decisionsQuery.data) {
    return (
      <Card>
        <Flex vertical align="center" gap={16}>
          <Text strong>Не удалось получить статистику</Text>
          <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
        </Flex>
      </Card>
    );
  }

  const summary = summaryQuery.data;
  const activity = activityQuery.data;
  const decisions = decisionsQuery.data;

  const averageMinutes = Math.max(1, Math.round(summary.averageReviewTime / 60));

  const axisStyle = {
    stroke: 'var(--chart-axis)',
    fill: 'var(--chart-axis)',
    fontSize: 12,
  };

  const gridStyle = {
    stroke: 'var(--chart-grid)',
  };

  return (
    <Flex vertical gap={24}>
      <Flex justify="space-between" align="center" wrap gap={16}>
        <Segmented options={periodOptions} value={period} onChange={(value) => setPeriod(value as StatsPeriod)} />
        <Button icon={<DownloadOutlined />} onClick={exportToCsv}>
          Экспорт CSV
        </Button>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <MetricCard title="Всего проверено" value={summary.totalReviewed.toString()} description="За выбранный период" />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <MetricCard title="% одобрено" value={`${summary.approvedPercentage.toFixed(1)}%`} />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <MetricCard title="% отклонено" value={`${summary.rejectedPercentage.toFixed(1)}%`} />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <MetricCard title="Среднее время" value={`${averageMinutes} мин`} description="На одно объявление" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Активность по дням">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis dataKey="date" tick={axisStyle} stroke={axisStyle.stroke} />
                  <YAxis tick={axisStyle} stroke={axisStyle.stroke} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" name="Одобрено" fill="#16a34a" />
                  <Bar dataKey="rejected" name="Отклонено" fill="#dc2626" />
                  <Bar dataKey="requestChanges" name="На доработку" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Распределение решений">
            <div style={{ height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Одобрено', value: decisions.approved },
                      { name: 'Отклонено', value: decisions.rejected },
                      { name: 'На доработку', value: decisions.requestChanges },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {pieColors.map((color) => (
                      <Cell key={color} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Категории проверенных объявлений">
        <div style={{ height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={categoriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
              <XAxis dataKey="name" tick={axisStyle} stroke={axisStyle.stroke} />
              <YAxis tick={axisStyle} stroke={axisStyle.stroke} />
              <Tooltip />
              <Bar dataKey="value" name="Количество" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </Flex>
  );
};


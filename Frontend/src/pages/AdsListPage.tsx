import type { MenuProps } from 'antd';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Flex,
  Input,
  Modal,
  Pagination,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  FilterOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAds } from '@/api/ads';
import { DEFAULT_PAGE_SIZE, DEFAULT_PRICE_RANGE } from '@/config/env';
import { CATEGORY_OPTIONS, PRIORITY_LABELS, STATUS_OPTIONS } from '@/constants/ads';
import { useAdsFilters, type AdsFilters } from '@/hooks/useAdsFilters';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { formatDate, formatPrice } from '@/utils/format';
import { saveNavigationSnapshot } from '@/utils/navigation';
import type { Ad, AdsResponse } from '@/types/ads';
import type { InputRef } from 'antd/es/input/Input';

const { Title, Text } = Typography;

export const AdsListPage = () => {
  const { filters, updateFilters, resetFilters } = useAdsFilters();
  const { presets, savePreset, removePreset } = useSavedFilters();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice ?? DEFAULT_PRICE_RANGE[0],
    filters.maxPrice ?? DEFAULT_PRICE_RANGE[1],
  ]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const searchRef = useRef<InputRef>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isFetching, error } = useQuery<AdsResponse>({
    queryKey: ['ads', filters],
    queryFn: ({ signal }) =>
      fetchAds(
        {
          ...filters,
          limit: DEFAULT_PAGE_SIZE,
        },
        signal,
      ),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data) {
      saveNavigationSnapshot(data.ads.map((ad) => ad.id));
    }
  }, [data]);

  useEffect(() => {
    setSearchValue(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    setPriceRange([
      filters.minPrice ?? DEFAULT_PRICE_RANGE[0],
      filters.maxPrice ?? DEFAULT_PRICE_RANGE[1],
    ]);
  }, [filters.maxPrice, filters.minPrice]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateFilters(
        {
          search: searchValue || undefined,
        },
        { preservePage: false },
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValue, updateFilters]);

  const handlePriceAfterChange = useCallback((value: [number, number]) => {
    const [min, max] = value;
    updateFilters({
      minPrice: min > DEFAULT_PRICE_RANGE[0] ? min : undefined,
      maxPrice: max < DEFAULT_PRICE_RANGE[1] ? max : undefined,
    });
  }, [updateFilters]);

  const handleCardClick = useCallback(
    (ad: Ad) => {
      navigate(`/item/${ad.id}`, {
        state: {
          from: `/list${location.search}`,
          neighbors: data?.ads.map((item) => item.id) ?? [],
        },
      });
    },
    [data?.ads, location.search, navigate],
  );

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      message.error('Введите название для набора фильтров');
      return;
    }

    savePreset(presetName.trim(), filters);
    message.success('Набор фильтров сохранён');
    setPresetName('');
    setIsSaveModalOpen(false);
  };

  const filterDropdownItems: MenuProps['items'] = useMemo(
    () =>
      presets.map((preset) => ({
        key: preset.id,
        onClick: () => {
          updateFilters(preset.filters, { preservePage: true });
          message.success(`Применён набор «${preset.name}»`);
        },
        label: (
          <Flex justify="space-between" align="center" gap={12}>
            <div>
              <Text strong>{preset.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(preset.createdAt).toLocaleString('ru-RU')}
              </Text>
            </div>
            <Space>
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  removePreset(preset.id);
                }}
              />
              <Button
                size="small"
                type="primary"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilters(preset.filters, { preservePage: true });
                  message.success(`Применён набор «${preset.name}»`);
                }}
              >
                Применить
              </Button>
            </Space>
          </Flex>
        ),
      })),
    [presets, removePreset, updateFilters],
  );

  useHotkeys(
    '/',
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    },
    [searchRef],
  );

  const content = useMemo(() => {
    if (isLoading && !data) {
      return (
        <Flex justify="center" style={{ padding: '80px 0' }}>
          <Spin size="large" />
        </Flex>
      );
    }

    if (error) {
      return (
        <Card>
          <Flex vertical align="center" gap={16}>
            <Text strong>Не удалось загрузить объявления</Text>
            <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </Flex>
        </Card>
      );
    }

    if (data && data.ads.length === 0) {
      return <Empty description="Нет объявлений по заданным фильтрам" />;
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          {data?.ads.map((ad) => (
            <Col xs={24} sm={12} lg={8} key={ad.id}>
              <Card
                hoverable
                cover={
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    style={{ height: 180, objectFit: 'cover' }}
                  />
                }
                onClick={() => handleCardClick(ad)}
              >
                <Flex justify="space-between" align="center">
                  <Tag color={ad.status === 'approved' ? 'green' : ad.status === 'rejected' ? 'red' : 'gold'}>
                    {STATUS_OPTIONS.find((option) => option.value === ad.status)?.label}
                  </Tag>
                  <Tag color={ad.priority === 'urgent' ? 'volcano' : 'blue'}>
                    {PRIORITY_LABELS[ad.priority]}
                  </Tag>
                </Flex>
                <Title level={4} style={{ marginTop: 8 }}>
                  {ad.title}
                </Title>
                <Text strong>{formatPrice(ad.price)}</Text>
                <Flex justify="space-between" style={{ marginTop: 12 }}>
                  <Text type="secondary">{ad.category}</Text>
                  <Text type="secondary">{formatDate(ad.createdAt)}</Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
        <Flex justify="space-between" align="center" style={{ marginTop: 24, flexWrap: 'wrap', gap: 16 }}>
          <Text type="secondary">
            Найдено объявлений: <strong>{data?.pagination.totalItems ?? 0}</strong>
          </Text>
          <Pagination
            current={filters.page}
            total={data?.pagination.totalItems ?? 0}
            pageSize={DEFAULT_PAGE_SIZE}
            showSizeChanger={false}
            onChange={(page) => updateFilters({ page }, { preservePage: true })}
          />
        </Flex>
      </>
    );
  }, [data, error, filters.page, handleCardClick, isLoading, updateFilters]);

  return (
    <Flex vertical gap={16}>
      <Card title="Фильтрация и поиск" extra={<Tag icon={isFetching ? <Spin size="small" /> : null}>Обновлено</Tag>}>
        <Flex vertical gap={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                ref={searchRef}
                placeholder="Поиск по названию или описанию (/)"
                prefix={<SearchOutlined />}
                allowClear
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                mode="multiple"
                allowClear
                placeholder="Статус"
                value={filters.status}
                onChange={(value) => updateFilters({ status: value })}
                options={STATUS_OPTIONS}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                allowClear
                placeholder="Категория"
                value={filters.categoryId}
                onChange={(value) =>
                  updateFilters({
                    categoryId: value ?? undefined,
                  })
                }
                options={CATEGORY_OPTIONS}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Text type="secondary">Диапазон цен, ₽</Text>
              <Slider
                range
                min={DEFAULT_PRICE_RANGE[0]}
                max={DEFAULT_PRICE_RANGE[1]}
                step={1000}
                value={priceRange}
                onChange={(value) => setPriceRange(value as [number, number])}
                onAfterChange={(value) => handlePriceAfterChange(value as [number, number])}
              />
            </Col>
            <Col xs={24} md={12}>
              <Flex justify="flex-end" gap={12} wrap>
                <Segmented
                  options={[
                    { label: 'Дата', value: 'createdAt' },
                    { label: 'Цена', value: 'price' },
                    { label: 'Приоритет', value: 'priority' },
                  ]}
                  value={filters.sortBy}
                  onChange={(value) => updateFilters({ sortBy: value as AdsFilters['sortBy'] })}
                />
                <Segmented
                  options={[
                    { label: 'По убыванию', value: 'desc' },
                    { label: 'По возрастанию', value: 'asc' },
                  ]}
                  value={filters.sortOrder}
                  onChange={(value) => updateFilters({ sortOrder: value as AdsFilters['sortOrder'] })}
                />
                <Tooltip title="Сбросить фильтры">
                  <Button icon={<ReloadOutlined />} onClick={resetFilters} />
                </Tooltip>
                <Dropdown
                  trigger={['click']}
                  menu={{ items: filterDropdownItems }}
                  disabled={presets.length === 0}
                >
                  <Button icon={<FilterOutlined />}>Сохранённые наборы</Button>
                </Dropdown>
                <Button icon={<SaveOutlined />} type="primary" onClick={() => setIsSaveModalOpen(true)}>
                  Сохранить фильтр
                </Button>
              </Flex>
            </Col>
          </Row>
        </Flex>
      </Card>

      <Card>
        {content}
      </Card>

      <Modal
        title="Сохранить набор фильтров"
        open={isSaveModalOpen}
        onOk={handleSavePreset}
        onCancel={() => setIsSaveModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название набора"
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
        />
      </Modal>
    </Flex>
  );
};


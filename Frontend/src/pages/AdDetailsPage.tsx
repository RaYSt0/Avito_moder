import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Result,
  Row,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  approveAdRequest,
  fetchAdById,
  rejectAdRequest,
  requestChangesAd,
} from '@/api/ads';
import { REJECTION_TEMPLATES, STATUS_OPTIONS } from '@/constants/ads';
import { formatDate, formatPrice } from '@/utils/format';
import { getNeighborIds } from '@/utils/navigation';

const { Title, Text } = Typography;

type ActionType = 'reject' | 'request';

export const AdDetailsPage = () => {
  const { id } = useParams();
  const adId = Number(id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; neighbors?: number[] } | undefined;
  const [modalType, setModalType] = useState<ActionType | null>(null);
  const [form] = Form.useForm<{ reason: string; comment?: string }>();

  const { data: ad, isLoading, isError } = useQuery({
    queryKey: ['ad', adId],
    queryFn: ({ signal }) => fetchAdById(adId, signal),
    enabled: Number.isFinite(adId),
  });

  const navigation = useMemo(() => getNeighborIds(adId, state?.neighbors), [adId, state?.neighbors]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ads'] });
    queryClient.invalidateQueries({ queryKey: ['ad', adId] });
  };

  const approveMutation = useMutation({
    mutationFn: () => approveAdRequest(adId),
    onSuccess: () => {
      message.success('Объявление одобрено');
      invalidate();
    },
    onError: () => message.error('Не удалось одобрить объявление'),
  });

  const rejectMutation = useMutation({
    mutationFn: (values: { reason: string; comment?: string }) => rejectAdRequest(adId, values),
    onSuccess: () => {
      message.success('Объявление отклонено');
      setModalType(null);
      form.resetFields();
      invalidate();
    },
    onError: () => message.error('Не удалось отклонить объявление'),
  });

  const requestChangesMutation = useMutation({
    mutationFn: (values: { reason: string; comment?: string }) => requestChangesAd(adId, values),
    onSuccess: () => {
      message.success('Отправлен запрос на доработку');
      setModalType(null);
      form.resetFields();
      invalidate();
    },
    onError: () => message.error('Не удалось отправить запрос'),
  });

  const handleBack = () => {
    navigate(state?.from ?? '/list');
  };

  const handleNavigate = (nextId: number | null) => {
    if (!nextId) {
      return;
    }

    navigate(`/item/${nextId}`, {
      state,
    });
  };

  useHotkeys(
    'a',
    () => {
      if (!approveMutation.isPending) {
        approveMutation.mutate();
      }
    },
    [approveMutation],
  );

  useHotkeys(
    'd',
    () => setModalType('reject'),
    [],
  );

  useHotkeys(
    'left',
    () => handleNavigate(navigation.prevId),
    [navigation.prevId],
  );

  useHotkeys(
    'right',
    () => handleNavigate(navigation.nextId),
    [navigation.nextId],
  );

  if (isLoading) {
    return (
      <Flex justify="center" style={{ padding: '80px 0' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (isError || !ad) {
    return (
      <Result
        status="500"
        title="Ошибка"
        subTitle="Не удалось загрузить объявление"
        extra={
          <Button type="primary" onClick={handleBack}>
            Вернуться к списку
          </Button>
        }
      />
    );
  }

  const statusLabel =
    STATUS_OPTIONS.find((option) => option.value === ad.status)?.label ?? ad.status;
  const isUrgent = ad.priority === 'urgent';

  return (
    <Flex vertical gap={24}>
      <Space wrap>
        <Button onClick={handleBack} icon={<RollbackOutlined />}>
          Назад к списку
        </Button>
        <Button disabled={!navigation.prevId} onClick={() => handleNavigate(navigation.prevId)}>
          ← Предыдущее
        </Button>
        <Button disabled={!navigation.nextId} onClick={() => handleNavigate(navigation.nextId)}>
          Следующее →
        </Button>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card>
            <Flex gap={16} align="center">
              <Tag color={ad.status === 'approved' ? 'green' : ad.status === 'rejected' ? 'red' : 'gold'}>
                {statusLabel}
              </Tag>
              <Tag color={isUrgent ? 'volcano' : 'blue'}>
                {isUrgent ? 'Срочное' : 'Обычное'}
              </Tag>
              <Text type="secondary">Создано: {formatDate(ad.createdAt, true)}</Text>
            </Flex>
            <Title level={3} style={{ marginTop: 16 }}>
              {ad.title}
            </Title>
            <Title level={4} type="success">
              {formatPrice(ad.price)}
            </Title>
            <Row gutter={12} style={{ marginTop: 16 }}>
              {ad.images.map((src) => (
                <Col span={8} key={src}>
                  <Image src={src} alt={ad.title} />
                </Col>
              ))}
            </Row>
            <Divider />
            <Title level={4}>Описание</Title>
            <Text>{ad.description}</Text>
            <Divider />
            <Title level={4}>Характеристики</Title>
            <Descriptions column={2} size="small">
              {Object.entries(ad.characteristics).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="Продавец">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Имя">{ad.seller.name}</Descriptions.Item>
                <Descriptions.Item label="Рейтинг">{ad.seller.rating}</Descriptions.Item>
                <Descriptions.Item label="Объявлений">{ad.seller.totalAds}</Descriptions.Item>
                <Descriptions.Item label="На платформе с">
                  {formatDate(ad.seller.registeredAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="История модерации">
              {ad.moderationHistory.length === 0 ? (
                <Alert message="История модерации пока отсутствует" type="info" showIcon />
              ) : (
                <Timeline
                  items={ad.moderationHistory.map((entry) => ({
                    color:
                      entry.action === 'approved'
                        ? 'green'
                        : entry.action === 'rejected'
                          ? 'red'
                          : 'blue',
                    children: (
                      <div>
                        <Text strong>{entry.moderatorName}</Text>
                        <br />
                        <Text type="secondary">{formatDate(entry.timestamp, true)}</Text>
                        <br />
                        <Text>{entry.comment}</Text>
                        {entry.reason && (
                          <>
                            <br />
                            <Tag>{entry.reason}</Tag>
                          </>
                        )}
                      </div>
                    ),
                  }))}
                />
              )}
            </Card>

            <Card title="Панель модератора">
              <Flex vertical gap={12}>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => approveMutation.mutate()}
                  loading={approveMutation.isPending}
                >
                  Одобрить (A)
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setModalType('reject')}
                >
                  Отклонить (D)
                </Button>
                <Button
                  type="dashed"
                  icon={<RollbackOutlined />}
                  onClick={() => setModalType('request')}
                >
                  Вернуть на доработку
                </Button>
              </Flex>
            </Card>

            <Card title="Горячие клавиши" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="A">Одобрить</Descriptions.Item>
                <Descriptions.Item label="D">Отклонить</Descriptions.Item>
                <Descriptions.Item label="← / →">Предыдущее / Следующее</Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        title={modalType === 'reject' ? 'Отклонить объявление' : 'Вернуть на доработку'}
        open={modalType !== null}
        onCancel={() => {
          setModalType(null);
          form.resetFields();
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              if (modalType === 'reject') {
                rejectMutation.mutate(values);
              } else {
                requestChangesMutation.mutate(values);
              }
            })
            .catch(() => undefined);
        }}
        okText="Отправить"
        confirmLoading={rejectMutation.isPending || requestChangesMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Причина"
            name="reason"
            rules={[{ required: true, message: 'Укажите причину' }]}
          >
            <Input placeholder="Например: Некорректное описание" />
          </Form.Item>
          <Form.Item label="Комментарий" name="comment">
            <Input.TextArea rows={4} placeholder="Опишите, что нужно исправить" />
          </Form.Item>
          <Space wrap>
            {REJECTION_TEMPLATES.map((template) => (
              <Tag
                key={template}
                color="blue"
                onClick={() => form.setFieldsValue({ reason: template })}
                style={{ cursor: 'pointer' }}
              >
                {template}
              </Tag>
            ))}
          </Space>
        </Form>
      </Modal>
    </Flex>
  );
};


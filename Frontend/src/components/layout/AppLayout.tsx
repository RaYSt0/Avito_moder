import { Layout, Space, Tag, Typography, Button } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { NavLink, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useModerator } from '@/hooks/useModerator';
import '@/index.css';

const { Header, Content } = Layout;

const navItems = [
  { path: '/list', label: 'Список объявлений' },
  { path: '/stats', label: 'Статистика' },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { mode, toggleTheme } = useTheme();
  const location = useLocation();
  const { data: moderator } = useModerator();

  const title = useMemo(() => {
    switch (location.pathname) {
      case '/stats':
        return 'Статистика модерации';
      case '/list':
        return 'Лента объявлений';
      default:
        return 'Система модерации';
    }
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <Space size={24} align="center">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Авито • Модерация
          </Typography.Title>
          <Space size={16}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link_active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </Space>
        </Space>
        <Space size="large" align="center" className="app-header__actions">
          {moderator && (
            <div className="app-header__user">
              <Typography.Text strong>{moderator.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {moderator.role}
              </Typography.Text>
            </div>
          )}
          <Tag color="blue">
            {moderator ? `Одобрено: ${moderator.statistics.approvalRate}%` : 'Загрузка...'}
          </Tag>
          <Button
            type="text"
            icon={mode === 'light' ? <BulbOutlined /> : <BulbFilled />}
            onClick={toggleTheme}
          />
        </Space>
      </Header>
      <Content className="app-content">
        <Typography.Title level={2} className="page-title">
          {title}
        </Typography.Title>
        {children}
      </Content>
    </Layout>
  );
};


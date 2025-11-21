import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="Страница не найдена"
      subTitle="Мы не можем найти страницу, которую вы ищете."
      extra={
        <Button type="primary" onClick={() => navigate('/list')}>
          Вернуться к списку
        </Button>
      }
    />
  );
};


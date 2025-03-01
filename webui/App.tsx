import { Explorer } from '@/Explorer'
import { ConfigProvider, message, Layout } from 'antd'
const { Content } = Layout

message.config({
  top: 8,
  duration: 1,
  maxCount: 3,
})

export default function App() {
  return (
    <ConfigProvider>
      <Layout>
        <Content
          style={{
            display: 'flex',
            justifyContent: 'center',
            height: '100vh',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <Explorer />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

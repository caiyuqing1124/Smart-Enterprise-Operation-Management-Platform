import { createApp } from 'vue'
import {
  Aim,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Avatar,
  Bell,
  Bottom,
  Briefcase,
  Calendar,
  ChatDotRound,
  ChatLineSquare,
  Checked,
  CircleCheck,
  CircleCheckFilled,
  Clock,
  CreditCard,
  DataAnalysis,
  DataBoard,
  DataLine,
  Delete,
  Document,
  DocumentAdd,
  Download,
  Edit,
  Expand,
  Fold,
  FullScreen,
  Histogram,
  List,
  Location,
  Lock,
  Management,
  Message,
  Money,
  MoreFilled,
  Odometer,
  OfficeBuilding,
  Opportunity,
  Plus,
  PriceTag,
  Printer,
  Refresh,
  Right,
  Search,
  Setting,
  Stamp,
  SwitchButton,
  Tickets,
  Top,
  TrendCharts,
  User,
  UserFilled,
  Wallet,
  WalletFilled,
  Warning,
  WarningFilled,
} from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import './styles/index.css'
import './styles/workbench.css'
import './styles/operations.css'
import './styles/sales.css'
import './styles/projects.css'
import './styles/finance.css'

const app = createApp(App)

const icons = {
  Aim,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Avatar,
  Bell,
  Bottom,
  Briefcase,
  Calendar,
  ChatDotRound,
  ChatLineSquare,
  Checked,
  CircleCheck,
  CircleCheckFilled,
  Clock,
  CreditCard,
  DataAnalysis,
  DataBoard,
  DataLine,
  Delete,
  Document,
  DocumentAdd,
  Download,
  Edit,
  Expand,
  Fold,
  FullScreen,
  Histogram,
  List,
  Location,
  Lock,
  Management,
  Message,
  Money,
  MoreFilled,
  Odometer,
  OfficeBuilding,
  Opportunity,
  Plus,
  PriceTag,
  Printer,
  Refresh,
  Right,
  Search,
  Setting,
  Stamp,
  SwitchButton,
  Tickets,
  Top,
  TrendCharts,
  User,
  UserFilled,
  Wallet,
  WalletFilled,
  Warning,
  WarningFilled,
}

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(createPinia())
app.use(router)
app.mount('#app')

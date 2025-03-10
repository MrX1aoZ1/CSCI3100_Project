import Image from "next/image";
import Link from "next/link";
import { PlusIcon, SunIcon, BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

// const tasksSlice = createSlice({
//   name: 'tasks',
//   initialState: [],
//   reducers: {
//     addTask: (state, action) => {
//       state.push(action.payload)
//     },
//     toggleComplete: (state, action) => {
//       const task = state.find(task => task.id === action.payload)
//       if(task) task.completed = !task.completed
//     }
//   }
// })

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧Logo和导航 */}
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">TickPulse</h1>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-500">今日</Link>
                <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-500">项目</Link>
                <Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-500">筛选</Link>
              </div>
            </div>

            {/* 右侧操作项 */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <SunIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <UserCircleIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 */}
          <aside className="w-64 hidden lg:block space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">列表</h2>
              <nav className="space-y-2">
                <Link href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>待办事项</span>
                </Link>
                <Link href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>已完成</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* 主任务区 */}
          <div className="flex-1">
            {/* 快速添加任务 */}
            <div className="mb-8">
              <button className="w-full flex items-center space-x-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <PlusIcon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">添加任务</span>
              </button>
            </div>

            {/* 今日重点 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">今日重点</h2>
                <span className="text-slate-500 text-sm">3个任务</span>
              </div>

              {/* 任务列表 */}
              <div className="space-y-4">
                {/* 任务项 */}
                <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">完成项目需求文档</h3>
                    <p className="text-sm text-slate-500">优先级：高</p>
                  </div>
                  <span className="text-sm text-slate-500">今天 15:00</span>
                </div>

                {/* 更多任务项... */}
              </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
}
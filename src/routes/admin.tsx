import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { verifySession, AUTH_COOKIE_NAME } from '@/lib/auth'
import { getCookie } from 'vinxi/http'

export const Route = createFileRoute('/admin')({
  component: Layout,
  loader: async () => {
    try {
      const token = getCookie(AUTH_COOKIE_NAME)
      if (!token || !(await verifySession(token))) {
        throw redirect({ to: '/login' })
      }
    } catch (e) {
      if (e instanceof Response) throw e
      // 忽略其他错误
    }
  }
})

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger className="m-4" />
        <div className="p-6 pt-0">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}

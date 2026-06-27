import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/settings")({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/app/settings') {
      throw redirect({ to: '/app/settings/account' })
    }
  },
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="w-full pb-12 pl-4 md:pl-8 lg:pl-12">
      <Outlet />
    </div>
  );
}

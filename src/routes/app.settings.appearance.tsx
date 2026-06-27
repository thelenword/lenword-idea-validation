import { createFileRoute } from "@tanstack/react-router";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";

export const Route = createFileRoute("/app/settings/appearance")({
  component: AppearanceSettingsPage,
});

function AppearanceSettingsPage() {
  return (
    <div className="w-full max-w-5xl pb-12">
      <AppearanceSettings />
    </div>
  );
}

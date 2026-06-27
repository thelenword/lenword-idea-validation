import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettings } from "@/components/settings/SecuritySettings";

export const Route = createFileRoute("/app/settings/security")({
  component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
  return (
    <div className="w-full max-w-5xl pb-12">
      <SecuritySettings />
    </div>
  );
}

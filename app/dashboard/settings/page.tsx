import SectionCard from "@/app/components/Dashboard/SectionCard";

export default function SettingsPage() {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Settings</h2>
          <p className="text-sm text-gray-500">System settings page scaffold. Add persistence for these toggles in your config store.</p>
        </div>
        <div className="grid gap-3 rounded-lg border border-gray-200 p-4 text-sm">
          <label className="flex items-center justify-between">
            <span>Email notifications</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between">
            <span>Push notifications</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between">
            <span>Maintenance mode</span>
            <input type="checkbox" className="h-4 w-4" />
          </label>
        </div>
      </div>
    </SectionCard>
  );
}

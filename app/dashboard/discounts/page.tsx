import SectionCard from "@/app/components/Dashboard/SectionCard";

const campaigns = [
  { code: "WELCOME10", discount: "10%", scope: "All courses", status: "Inactive" },
  { code: "SUMMER20", discount: "20%", scope: "Selected courses", status: "Inactive" },
];

export default function DiscountsPage() {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Discounts</h2>
          <p className="text-sm text-gray-500">Marketing discounts page is prepared. Hook campaign create/update actions next.</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((item) => (
                <tr key={item.code} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.code}</td>
                  <td className="px-4 py-3">{item.discount}</td>
                  <td className="px-4 py-3">{item.scope}</td>
                  <td className="px-4 py-3">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

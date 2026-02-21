import SectionCard from "@/app/components/Dashboard/SectionCard";

const tickets = [
  { id: "TCK-001", user: "Pending", subject: "Pending", priority: "Normal", status: "Open" },
  { id: "TCK-002", user: "Pending", subject: "Pending", priority: "Low", status: "Open" },
];

export default function SupportTicketsPage() {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Support Tickets</h2>
          <p className="text-sm text-gray-500">Support workspace placeholder. Connect ticket ingestion and status workflows here.</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.user}</td>
                  <td className="px-4 py-3">{item.subject}</td>
                  <td className="px-4 py-3">{item.priority}</td>
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

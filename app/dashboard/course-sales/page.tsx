import SectionCard from "@/app/components/Dashboard/SectionCard";

const sales = [
  { orderId: "ORD-1001", course: "Pending", buyer: "Pending", amount: "$0.00", date: "-" },
  { orderId: "ORD-1002", course: "Pending", buyer: "Pending", amount: "$0.00", date: "-" },
];

export default function CourseSalesPage() {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Course Sales</h2>
          <p className="text-sm text-gray-500">Payments reporting scaffold. Attach your transaction collection to populate this table.</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item) => (
                <tr key={item.orderId} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.orderId}</td>
                  <td className="px-4 py-3">{item.course}</td>
                  <td className="px-4 py-3">{item.buyer}</td>
                  <td className="px-4 py-3">{item.amount}</td>
                  <td className="px-4 py-3">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

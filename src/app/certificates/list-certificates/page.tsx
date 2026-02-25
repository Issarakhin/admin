import SectionCard from "@/components/SectionCard";

const certificates = [
  { id: "CERT-0001", student: "Pending", course: "Pending", issuedAt: "-", status: "Draft" },
  { id: "CERT-0002", student: "Pending", course: "Pending", issuedAt: "-", status: "Draft" },
];

export default function ListCertificatesPage() {
  return (
    <SectionCard>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Certificates</h2>
          <p className="text-sm text-gray-500">Certificate module scaffold is ready. Connect this page to your certificate data source.</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Issued At</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.student}</td>
                  <td className="px-4 py-3">{item.course}</td>
                  <td className="px-4 py-3">{item.issuedAt}</td>
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

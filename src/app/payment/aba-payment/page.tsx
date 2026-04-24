"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import SectionCard from "@/components/SectionCard";
import { db } from "@/lib/config/firebase";

interface EnrollmentRecord {
  courseId?: string;
  courseTitle?: string;
  enrolledAt?: string | Timestamp;
  date?: string;
  price?: string | number;
  status?: string;
  paymentMethod?: string;
  transactionId?: string;
  username?: string;
}

interface AbaTransactionRow {
  id: string;
  tranId: string;
  course: string;
  payer: string;
  amount: string;
  status: string;
  date: string;
  sortAt: number;
}

const badgeStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  DECLINED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

const formatAmount = (value: string | number | undefined) => {
  if (typeof value === "number") {
    return `$${value.toFixed(2)}`;
  }

  if (typeof value === "string" && value.trim()) {
    if (value.toLowerCase() === "free") {
      return "Free";
    }
    return value.startsWith("$") ? value : `$${value}`;
  }

  return "-";
};

const formatDate = (value: string | Timestamp | undefined) => {
  if (!value) {
    return "-";
  }

  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return value;
};

const toSortTime = (value: string | Timestamp | undefined) => {
  if (!value) {
    return 0;
  }

  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function AbaPaymentPage() {
  const [rows, setRows] = useState<AbaTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAbaTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const nextRows: AbaTransactionRow[] = [];

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data() as {
            username?: string;
            fullName?: string;
            enrollment?: unknown;
          };

          const enrollments = Array.isArray(userData.enrollment)
            ? (userData.enrollment as EnrollmentRecord[])
            : [];

          enrollments.forEach((record, index) => {
            if (record.paymentMethod !== "ABA KHQR") {
              return;
            }

            const status = (record.status || "completed").toUpperCase();
            const timeRef = record.enrolledAt || record.date;

            nextRows.push({
              id: `${userDoc.id}-${record.transactionId || record.courseId || index}`,
              tranId: record.transactionId || "-",
              course: record.courseTitle || "-",
              payer: record.username || userData.username || userData.fullName || "-",
              amount: formatAmount(record.price),
              status,
              date: formatDate(timeRef),
              sortAt: toSortTime(timeRef),
            });
          });
        });

        nextRows.sort((a, b) => b.sortAt - a.sortAt);
        setRows(nextRows);
      } catch (loadError) {
        console.error("Failed to load ABA payments:", loadError);
        setError("Failed to load ABA payments from database.");
      } finally {
        setLoading(false);
      }
    };

    void loadAbaTransactions();
  }, []);

  return (
    <SectionCard>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">ABA Payment</h2>
          <p className="text-sm text-gray-500">
            Auto-approved ABA KHQR payments fetched from database.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Tran ID</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    Loading ABA payments...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    No ABA payments found.
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#2c3e50]">{item.tranId}</td>
                    <td className="px-4 py-3">{item.course}</td>
                    <td className="px-4 py-3">{item.payer}</td>
                    <td className="px-4 py-3">{item.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[item.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

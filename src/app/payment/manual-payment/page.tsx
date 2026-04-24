"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import SectionCard from "@/components/SectionCard";
import { db } from "@/lib/config/firebase";

type ReviewStatus = "pending" | "approved" | "rejected";

interface EnrollmentRecord {
  courseId?: string;
  courseTitle?: string;
  enrolledAt?: string;
  instructor?: string;
  price?: string;
  thumbnail?: string;
  username?: string;
  enrolledCourse?: boolean;
  date?: string;
  items?: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    category: string;
    image: string;
  }>;
  total?: number;
  paymentMethod?: string;
  status?: string;
  transactionId?: string;
}

interface ManualPaymentRecord {
  id: string;
  userId?: string;
  courseId?: string;
  courseTitle: string;
  username: string;
  email: string;
  amount: string;
  status: ReviewStatus;
  submittedAt: string;
  sortAt: number;
}

const formatAmount = (value: string | number | undefined) => {
  if (typeof value === "number") {
    return `$${value.toFixed(2)}`;
  }

  if (typeof value === "string" && value.trim()) {
    return value.startsWith("$") ? value : `$${value}`;
  }

  return "-";
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
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

export default function ManualPaymentPage() {
  const [rows, setRows] = useState<ManualPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState("");
  const [error, setError] = useState("");

  const loadManualPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const requestQuery = query(collection(db, "manualPayments"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(requestQuery);

      const nextRows = snapshot.docs.map((manualDoc) => {
        const data = manualDoc.data() as {
          userId?: string;
          courseId?: string;
          courseTitle?: string;
          username?: string;
          email?: string;
          amount?: string | number;
          status?: string;
          createdAt?: Timestamp | string;
        };

        const status = (data.status || "pending").toLowerCase() as ReviewStatus;

        return {
          id: manualDoc.id,
          userId: data.userId,
          courseId: data.courseId,
          courseTitle: data.courseTitle || "-",
          username: data.username || "-",
          email: data.email || "-",
          amount: formatAmount(data.amount),
          status,
          submittedAt: formatDate(data.createdAt),
          sortAt: toSortTime(data.createdAt),
        };
      });

      nextRows.sort((a, b) => b.sortAt - a.sortAt);
      setRows(nextRows);
    } catch (loadError) {
      console.error("Failed to load manual payment requests:", loadError);
      setError("Failed to load manual payment requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadManualPayments();
  }, []);

  const updateEnrollmentForReview = async (record: ManualPaymentRecord, nextStatus: ReviewStatus) => {
    if (!record.userId || !record.courseId) {
      return;
    }

    const userRef = doc(db, "users", record.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return;
    }

    const enrollmentRaw = userSnap.data().enrollment;
    const enrollments = Array.isArray(enrollmentRaw) ? (enrollmentRaw as EnrollmentRecord[]) : [];

    // Does the user already have a manual enrollment entry for this course?
    const existingIndex = enrollments.findIndex((entry) => {
      const sameCourse = entry.courseId === record.courseId;
      const manualMethod = (entry.paymentMethod || "").toLowerCase() === "manual";
      return sameCourse && manualMethod;
    });

    if (nextStatus === "rejected") {
      // If the user had a stale pending manual enrollment from an older flow,
      // mark it rejected so the course stays locked. Otherwise do nothing.
      if (existingIndex >= 0) {
        const updated = [...enrollments];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: "rejected",
        };
        await updateDoc(userRef, { enrollment: updated });
      }
      return;
    }

    if (nextStatus !== "approved") {
      return;
    }

    // Approving: ensure the user has a completed manual enrollment for this course.
    // Load the course to populate enrollment data (since the buyer no longer writes it).
    const courseRef = doc(db, "courses", record.courseId);
    const courseSnap = await getDoc(courseRef);
    const courseData = courseSnap.exists() ? (courseSnap.data() as Record<string, unknown>) : {};

    const rawPrice = courseData.price;
    const priceStr =
      typeof rawPrice === "number" ? String(rawPrice) : typeof rawPrice === "string" ? rawPrice : "0";
    const priceNum = parseFloat(priceStr) || 0;
    const isFree = priceNum === 0;

    const enrollmentEntry: EnrollmentRecord = {
      courseId: record.courseId,
      courseTitle:
        (courseData.courseTitle as string) || record.courseTitle || "-",
      enrolledAt: new Date().toISOString(),
      instructor: (courseData.instructor as string) || "-",
      price: isFree ? "Free" : priceStr,
      thumbnail: (courseData.thumbnail as string) || "",
      username: record.username || "-",
      enrolledCourse: true,
      date: new Date().toISOString().split("T")[0],
      items: [
        {
          id: record.courseId,
          title: (courseData.courseTitle as string) || record.courseTitle || "-",
          price: priceNum,
          quantity: 1,
          category: (courseData.categories as string) || "",
          image: (courseData.thumbnail as string) || "",
        },
      ],
      total: priceNum,
      status: "completed",
      paymentMethod: "Manual",
    };

    let nextEnrollments: EnrollmentRecord[];
    let wasAlreadyCompleted = false;

    if (existingIndex >= 0) {
      const current = enrollments[existingIndex];
      wasAlreadyCompleted = (current.status || "").toLowerCase() === "completed";
      nextEnrollments = [...enrollments];
      nextEnrollments[existingIndex] = {
        ...current,
        ...enrollmentEntry,
      };
    } else {
      nextEnrollments = [...enrollments, enrollmentEntry];
    }

    await updateDoc(userRef, { enrollment: nextEnrollments });

    if (!wasAlreadyCompleted && !isFree) {
      await updateDoc(courseRef, {
        enrolledStudents: increment(1),
      });
    }
  };

  const handleReview = async (record: ManualPaymentRecord, nextStatus: ReviewStatus) => {
    if (record.status !== "pending") {
      return;
    }

    setActioningId(record.id);
    setError("");

    try {
      const requestRef = doc(db, "manualPayments", record.id);
      await updateDoc(requestRef, {
        status: nextStatus,
        reviewedAt: serverTimestamp(),
      });

      await updateEnrollmentForReview(record, nextStatus);

      setRows((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );
    } catch (reviewError) {
      console.error("Failed to review manual payment:", reviewError);
      setError("Failed to update payment status.");
    } finally {
      setActioningId("");
    }
  };

  return (
    <SectionCard>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Manual Payment</h2>
          <p className="text-sm text-gray-500">
            Review manual requests submitted after users pay by QR and send transaction details to @seakyarith.
          </p>
        </div>

        <div className="rounded-lg border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
          Approval flow: Approve will mark the request as approved, change user enrollment status to completed, and increment enrolled student count.
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
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    Loading manual payments...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    No manual payment requests found.
                  </td>
                </tr>
              ) : (
                rows.map((item) => {
                  const statusLabel = item.status.toUpperCase();
                  const isPending = item.status === "pending";
                  const isBusy = actioningId === item.id;

                  return (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-[#2c3e50]">{item.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#2c3e50]">{item.username}</div>
                        <div className="text-xs text-gray-500">{item.email}</div>
                      </td>
                      <td className="px-4 py-3">{item.courseTitle}</td>
                      <td className="px-4 py-3">{item.amount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[statusLabel] || "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.submittedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReview(item, "approved")}
                            disabled={!isPending || isBusy}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(item, "rejected")}
                            disabled={!isPending || isBusy}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

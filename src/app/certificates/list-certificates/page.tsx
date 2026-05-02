"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import SectionCard from "@/components/SectionCard";
import { db } from "@/lib/config/firebase";

interface UserProgressDoc {
  certificateId?: string;
  completedCourse?: boolean;
  courseTitle?: string;
  lastUpdated?: string | Timestamp;
}

interface UserDoc {
  username?: string;
  fullName?: string;
  name?: string;
  email?: string;
}

interface CertificateRow {
  id: string;
  certificateId: string;
  student: string;
  email: string;
  course: string;
  issuedAt: string;
  sortAt: number;
}

const formatDate = (value: string | Timestamp | undefined) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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

const parseProgressDocId = (progressId: string) => {
  const separatorIndex = progressId.indexOf("_");

  if (separatorIndex === -1) {
    return { userId: progressId, courseId: "" };
  }

  return {
    userId: progressId.slice(0, separatorIndex),
    courseId: progressId.slice(separatorIndex + 1),
  };
};

export default function ListCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificates = async () => {
      setLoading(true);
      setError("");

      try {
        const progressSnapshot = await getDocs(collection(db, "userProgress"));
        const userCache = new Map<string, UserDoc | null>();

        const rows = await Promise.all(
          progressSnapshot.docs.map(async (progressDoc) => {
            const progress = progressDoc.data() as UserProgressDoc;

            if (!progress.completedCourse) {
              return null;
            }

            const { userId } = parseProgressDocId(progressDoc.id);
            let userData = userCache.get(userId);

            if (userData === undefined) {
              const userSnap = await getDoc(doc(db, "users", userId));
              userData = userSnap.exists() ? (userSnap.data() as UserDoc) : null;
              userCache.set(userId, userData);
            }

            const issuedAt = progress.lastUpdated;

            return {
              id: progressDoc.id,
              certificateId: progress.certificateId || "Missing ID",
              student: userData?.username || userData?.fullName || userData?.name || "Unknown Student",
              email: userData?.email || "-",
              course: progress.courseTitle || "Untitled Course",
              issuedAt: formatDate(issuedAt),
              sortAt: toSortTime(issuedAt),
            } satisfies CertificateRow;
          })
        );

        setCertificates(
          rows
            .filter((row): row is CertificateRow => row !== null)
            .sort((a, b) => b.sortAt - a.sortAt)
        );
      } catch (loadError) {
        console.error("Failed to load certificates:", loadError);
        setError("Failed to load certificates from database.");
      } finally {
        setLoading(false);
      }
    };

    void loadCertificates();
  }, []);

  return (
    <SectionCard>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">Certificates</h2>
          <p className="text-sm text-gray-500">
            Completed course certificates pulled from user progress records.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Issued At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    Loading certificates...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    No certificates found.
                  </td>
                </tr>
              ) : (
                certificates.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#2c3e50]">{item.certificateId}</td>
                    <td className="px-4 py-3">{item.student}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">{item.course}</td>
                    <td className="px-4 py-3">{item.issuedAt}</td>
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

"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminData } from "./dashboard-types";

interface ProfileAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminData: AdminData | null;
  onSave: (data: AdminData) => Promise<void>;
}

const ProfileAdminModal = ({ isOpen, onClose, adminData, onSave }: ProfileAdminModalProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<AdminData>({
    username: adminData?.username || "",
    email: adminData?.email || "",
    role: adminData?.role || "admin",
    profileImage: adminData?.profileImage || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  useEffect(() => {
    if (adminData) {
      setFormData({
        username: adminData.username,
        email: adminData.email,
        role: adminData.role,
        profileImage: adminData.profileImage,
      });
    }
  }, [adminData]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#fff] dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
          >
            <h2 className=" text-center mb-6 text-gray-800 dark:text-white" style={{ fontSize: 20, fontWeight: 700 }}>
              Admin Profile
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Username:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={{ fontSize: 15 }}
                    className="
                  w-full h-[40px] px-4
                  bg-white dark:bg-slate-800
                  border border-slate-300 dark:border-slate-600
                  rounded-[15px]
                  text-slate-900 dark:text-slate-100
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-all duration-200 ease-in-out
                "
                  />
                ) : (
                  <p className="
                w-full min-h-[40px] px-4 py-2.5
                bg-slate-100 dark:bg-slate-800
                text-slate-900 dark:text-slate-100
                rounded-[15px]
              ">
                    {formData.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email:
                </label>
                <p className="
                  w-full min-h-[40px] px-4 py-2.5
                  bg-slate-100 dark:bg-slate-800
                  text-slate-900 dark:text-slate-100
                  rounded-[15px]
                ">
                  {formData.email}
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Role:
                </label>
                <p className="
                w-full min-h-[40px] px-4 py-2.5
                bg-slate-100 dark:bg-slate-800
                text-slate-900 dark:text-slate-100
                rounded-[15px]
              ">
                  {formData.role}
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-4 mt-8">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      onClose();
                    }}
                    style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, paddingTop: 10, paddingBottom: 10, paddingLeft: 40, paddingRight: 40 }}
                    className="px-6 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, paddingTop: 10, paddingBottom: 10, paddingLeft: 40, paddingRight: 40 }}
                    className="px-6 py-2 bg-[#F47834] text-white hover:bg-[#F0B13B] transition"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, paddingTop: 10, paddingBottom: 10, paddingLeft: 40, paddingRight: 40 }}
                    className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-900 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, paddingTop: 10, paddingBottom: 10, paddingLeft: 40, paddingRight: 40 }}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileAdminModal;

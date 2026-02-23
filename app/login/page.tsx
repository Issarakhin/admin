"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Modal from "@/app/components/ui/Modals";
import loadingAnimation from "@/app/assets/animations/sand-loading.json";
import failedAnimation from "@/app/assets/animations/failed.json";
import successAnimation from "@/app/assets/animations/success.json";
import DG from "@/app/assets/animations/login-1.json";
import BGAnimation from "@/app/assets/animations/bg-style3.json";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import FloatingInput from "@/app/login/FloatingInput";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface AuthData {
  password: string;
}

interface ModalConfig {
  show: boolean;
  message: string;
  type: "loading" | "success" | "error";
}

export default function AuthPreview() {
  const router = useRouter();
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    show: false,
    message: "",
    type: "loading",
  });
  const [loginData, setLoginData] = useState<AuthData>({ password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalConfig({ show: true, message: "Please Wait", type: "loading" });

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginData.password }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        setModalConfig({
          show: true,
          message: data.message || "Login failed. Please try again.",
          type: "error",
        });
        return;
      }

      setIsAuthenticated(true);
      setModalConfig({ show: true, message: "You have logged in successfully!", type: "success" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again!";
      setModalConfig({ show: true, message: errorMessage, type: "error" });
    }
  };

  const handleModalClose = () => {
    if (modalConfig.type === "success" && isAuthenticated) {
      router.push("/dashboard/overview");
    }
    setModalConfig({ show: false, message: "", type: "loading" });
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
        }}
      >
        <Lottie animationData={BGAnimation} loop={true} />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <div>
          <Card className="w-full bg-white shadow-lg relative z-10 p-0 overflow-hidden" style={{ borderRadius: 20, width: 800 }}>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 bg-gray-50 flex items-center justify-center">
                <Lottie animationData={DG} loop autoplay style={{ width: 280, height: 280 }} />
              </div>
              <div className="w-full md:w-3/5 p-6">
                <CardHeader className="space-y-1 pt-2 pb-1 px-0">
                  <CardTitle
                    className="text-2xl font-bold text-center"
                    style={{ fontFamily: "'Barlow', sans-serif", fontSize: 20, fontWeight: 600, color: "#2c3e50" }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 400, paddingBottom: "6px", display: "inline-block" }}>
                      Welcome to
                    </span>
                    <br />
                    DG Next Admin Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-0">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <FloatingInput
                      label="Type admin password"
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      required
                      showPassword={showLoginPassword}
                      onTogglePassword={() => setShowLoginPassword(!showLoginPassword)}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-[#2c3e50] hover:bg-[#62748E] text-white"
                      style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, color: "#fff", paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20 }}
                    >
                      LOGIN
                    </Button>
                  </form>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>

        <footer
          className="relative z-10 mt-6 text-center text-sm text-[#2c3e50]"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          ©{new Date().getFullYear()} Powered by DG Next
        </footer>

        {modalConfig.show && (
          <Modal isOpen={modalConfig.show} onClose={handleModalClose}>
            <div className="text-center px-2 py-2">
              {modalConfig.type === "loading" && (
                <>
                  <Lottie
                    animationData={loadingAnimation}
                    loop
                    autoplay
                    style={{ width: 150, height: 150, margin: "0 auto" }}
                  />
                </>
              )}

              {modalConfig.type === "success" && (
                <>
                  <Lottie
                    animationData={successAnimation}
                    loop
                    style={{ width: 150, height: 150, margin: "0 auto" }}
                  />
                  <h2
                    className="text-lg font-semibold mb-3"
                    style={{ fontFamily: "'Barlow', sans-serif", color: "#2ecc71" }}
                  >
                    Login Successfully! <br /> <span style={{ fontSize: 14, fontWeight: 400, color: "#6e737c" }}>Welcome Back.</span>
                  </h2>
                  <Button
                    className="mt-4 bg-[#2c3e50] hover:bg-[#1c2b3a] text-white"
                    onClick={handleModalClose}
                    style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, color: "#fff", paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, border: "1px solid #2c3e50" }}
                  >
                    Okay
                  </Button>
                </>
              )}

              {modalConfig.type === "error" && (
                <>
                  <Lottie
                    animationData={failedAnimation}
                    loop
                    style={{ width: 150, height: 150, margin: "0 auto" }}
                  />
                  <h2
                    className="text-lg font-semibold mb-3"
                    style={{ fontSize: 16, fontWeight: 800, color: "#e74c3c" }}
                  >
                    Login Failed! <br /> <span style={{ fontSize: 14, fontWeight: 400, color: "#6e737c" }}>{modalConfig.message || "Please try again."}</span>
                  </h2>
                  <Button
                    className="mt-4 bg-[#2c3e50] hover:bg-[#1c2b3a] text-white"
                    onClick={handleModalClose}
                    style={{ borderRadius: 15, fontWeight: 400, fontSize: 15, color: "#fff", paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, border: "1px solid #2c3e50" }}
                  >
                    Okay
                  </Button>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}

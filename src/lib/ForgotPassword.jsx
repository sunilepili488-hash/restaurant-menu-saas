import React from "react";
import { Navigate } from "react-router-dom";

// Password reset is managed inside the restaurant settings (BrandingSection).
export default function ForgotPassword() {
  return <Navigate to="/login" replace />;
}

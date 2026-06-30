import React from "react";
import { Navigate } from "react-router-dom";

// Password reset is managed inside the restaurant settings (BrandingSection).
export default function ResetPassword() {
  return <Navigate to="/login" replace />;
}

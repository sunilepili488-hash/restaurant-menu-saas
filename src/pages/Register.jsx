import React from "react";
import { Navigate } from "react-router-dom";

// Registration is no longer needed — admin credentials are managed
// inside the restaurant settings (BrandingSection) after login.
export default function Register() {
  return <Navigate to="/login" replace />;
}

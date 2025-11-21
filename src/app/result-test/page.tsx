"use client";

import { Suspense } from "react";
import ResultContent from "./result-content";

export default function ResultPage() {
  return (
    <Suspense fallback={<div style={{ color: "white", padding: 20 }}>Carregando...</div>}>
      <ResultContent />
    </Suspense>
  );
}
import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from "@react-email/components";

interface WeeklyReportEmailProps {
  weekLabel?: string;
  kpiSnapshot?: {
    totalCustomers: number;
    openDealsValue: number;
    tasksCompleted: number;
    winRatePercent: number;
  };
}

/**
 * React Email Template: WeeklyReportEmail
 * 
 * Client Compatibility Comment:
 * - Employs inline CSS for cross-client table and box rendering.
 * - Local preview CLI command: `npx react-email preview`
 */
export default function WeeklyReportEmail({
  weekLabel = "Week of July 24, 2026",
  kpiSnapshot = {
    totalCustomers: 124,
    openDealsValue: 285000,
    tasksCompleted: 42,
    winRatePercent: 68,
  },
}: WeeklyReportEmailProps) {
  const formattedDeals = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpiSnapshot.openDealsValue);

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "32px", border: "1px solid #334155" }}>
          <Heading style={{ color: "#ffffff", fontSize: "22px", margin: "0 0 8px" }}>
            📊 Executive Sales & Operations Brief
          </Heading>
          <Text style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 20px" }}>
            {weekLabel}
          </Text>

          {/* Grid Container */}
          <Section style={{ margin: "20px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px" }}>Total Customers</Text>
                <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{kpiSnapshot.totalCustomers}</Text>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px" }}>Open Pipeline</Text>
                <Text style={{ color: "#818cf8", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{formattedDeals}</Text>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px" }}>Tasks Closed</Text>
                <Text style={{ color: "#34d399", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{kpiSnapshot.tasksCompleted}</Text>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px" }}>Win Rate</Text>
                <Text style={{ color: "#fbbf24", fontSize: "20px", fontWeight: "bold", margin: 0 }}>{kpiSnapshot.winRatePercent}%</Text>
              </div>
            </div>
          </Section>

          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button
              href="https://yournexuscrm.app/reports"
              style={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Open Full Analytics Suite
            </Button>
          </Section>
          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />
          <Text style={{ color: "#64748b", fontSize: "12px", textAlign: "center" }}>
            © {new Date().getFullYear()} NexusCRM Analytics Engine.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

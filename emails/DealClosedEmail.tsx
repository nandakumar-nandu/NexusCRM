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

interface DealClosedEmailProps {
  dealTitle?: string;
  value?: number;
  stage?: "Closed" | "Proposal" | "Qualified";
}

/**
 * React Email Template: DealClosedEmail
 * 
 * Client Compatibility Comment:
 * - Uses inline styles for rendering across legacy and web email clients.
 * - Local preview command: `npx react-email preview`
 */
export default function DealClosedEmail({
  dealTitle = "Enterprise CRM Deal",
  value = 50000,
  stage = "Closed",
}: DealClosedEmailProps) {
  const formattedValue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "32px", border: "1px solid #334155" }}>
          <Heading style={{ color: "#10b981", fontSize: "22px", margin: "0 0 16px" }}>
            🎉 Sales Deal Update: {stage}
          </Heading>
          <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "24px" }}>
            A sales opportunity status update was recorded in your pipeline:
          </Text>
          <Section style={{ backgroundColor: "#0f172a", padding: "20px", borderRadius: "8px", margin: "16px 0", borderLeft: "4px solid #10b981" }}>
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: "18px", margin: "0 0 8px" }}>
              {dealTitle}
            </Text>
            <Text style={{ color: "#10b981", fontWeight: "bold", fontSize: "20px", margin: "0 0 4px" }}>
              {formattedValue}
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Current Stage: <strong>{stage}</strong>
            </Text>
          </Section>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button
              href="https://yournexuscrm.app/leads"
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              View Pipeline Board
            </Button>
          </Section>
          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />
          <Text style={{ color: "#64748b", fontSize: "12px", textAlign: "center" }}>
            © {new Date().getFullYear()} NexusCRM Sales Engine.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

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

interface WelcomeCustomerEmailProps {
  customerName?: string;
  addedByName?: string;
}

/**
 * React Email Template: WelcomeCustomerEmail
 * 
 * Client Compatibility Comment:
 * - Email clients (Outlook, Gmail, Yahoo, Apple Mail) strip external CSS stylesheets and CSS variables.
 *   All styles MUST use inline CSS objects (style={{ ... }}).
 * - Preview locally in development by running: `npx react-email preview`
 */
export default function WelcomeCustomerEmail({
  customerName = "Valued Customer",
  addedByName = "Account Executive",
}: WelcomeCustomerEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "32px", border: "1px solid #334155" }}>
          <Heading style={{ color: "#ffffff", fontSize: "24px", margin: "0 0 16px" }}>
            Welcome to NexusCRM!
          </Heading>
          <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "24px" }}>
            Hello <strong>{customerName}</strong>,
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "24px" }}>
            You have been successfully added to our enterprise CRM database by <strong>{addedByName}</strong>.
            We look forward to partnering with your team and providing seamless account support.
          </Text>
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button
              href="https://yournexuscrm.app"
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
              Access Account Portal
            </Button>
          </Section>
          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />
          <Text style={{ color: "#64748b", fontSize: "12px", textAlign: "center" }}>
            © {new Date().getFullYear()} NexusCRM Inc. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

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

interface TaskReminderEmailProps {
  taskTitle?: string;
  dueDate?: string;
  isOverdue?: boolean;
}

/**
 * React Email Template: TaskReminderEmail
 * 
 * Client Compatibility Comment:
 * - Email clients strip external stylesheets; inline CSS styling is enforced.
 * - Local preview trigger command: `npx react-email preview`
 */
export default function TaskReminderEmail({
  taskTitle = "Schedule Follow-up Call",
  dueDate = "Today at 5:00 PM",
  isOverdue = false,
}: TaskReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "32px", border: "1px solid #334155" }}>
          <Heading style={{ color: isOverdue ? "#f43f5e" : "#6366f1", fontSize: "22px", margin: "0 0 16px" }}>
            {isOverdue ? "⚠️ Overdue Task Alert" : "📅 Upcoming Task Reminder"}
          </Heading>
          <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "24px" }}>
            This is an automated notification for your assigned task:
          </Text>
          <Section style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", margin: "16px 0", borderLeft: isOverdue ? "4px solid #f43f5e" : "4px solid #6366f1" }}>
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: "16px", margin: "0 0 4px" }}>
              {taskTitle}
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Due Date: <strong>{dueDate}</strong>
            </Text>
          </Section>
          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button
              href="https://yournexuscrm.app/tasks"
              style={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Open Tasks Dashboard
            </Button>
          </Section>
          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />
          <Text style={{ color: "#64748b", fontSize: "12px", textAlign: "center" }}>
            © {new Date().getFullYear()} NexusCRM Task Scheduler.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

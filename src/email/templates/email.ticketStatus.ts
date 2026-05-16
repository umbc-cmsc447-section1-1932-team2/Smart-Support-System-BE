import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface TicketStatusEmailProps {
  userName: string;
  ticketId: string;
  agentName: string;
  ticketStatus: string;
  message: string;
  unsubscribeUrl: string;
}

export function TicketStatusEmail({
  userName,
  ticketId,
  agentName,
  ticketStatus,
  message,
  unsubscribeUrl,
}: TicketStatusEmailProps) {
  return (
    <p>
      Hello <strong>{userName}</strong>,
    </p>
  );
}

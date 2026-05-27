import { MailSearch } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client";
import { bookingActions } from "../redux/slices/bookingSlice";
import { EntityPage } from "./EntityPage";

export function InquiriesPage() {
  const [scanning, setScanning] = useState(false);

  async function scanEmails() {
    setScanning(true);
    try {
      await api.post("/emails/scan");
      window.location.reload();
    } finally {
      setScanning(false);
    }
  }

  return <EntityPage title="Inquiries" subtitle="Email-parsed and manually created booking requests." stateKey="bookings" actions={bookingActions} columns={[
    { key: "bookingId", header: "Booking ID" }, { key: "passengerName", header: "Passenger" }, { key: "mobileNumber", header: "Mobile" }, { key: "carType", header: "Car Type" }, { key: "status", header: "Status" }
  ]} fields={[
    { name: "bookingId", label: "Booking ID" }, { name: "businessUnit", label: "Business Unit", required: false }, { name: "passengerName", label: "Passenger Name" }, { name: "mobileNumber", label: "Mobile Number", required: false }, { name: "reportingAddress", label: "Reporting Address", full: true, required: false }, { name: "dropAddress", label: "Drop Address", full: true, required: false }, { name: "carType", label: "Car Type", required: false }, { name: "cabRequestNumber", label: "Cab Request No", required: false }, { name: "status", label: "Status", type: "select", options: ["New", "Pending Assignment", "Cancelled"] }
  ]} extraActions={<button className="btn-secondary" onClick={scanEmails} disabled={scanning}><MailSearch className="h-4 w-4" />{scanning ? "Scanning..." : "Scan Email"}</button>} canEditRow={(row) => row.status !== "Assigned"} lockedLabel="Converted" />;
}

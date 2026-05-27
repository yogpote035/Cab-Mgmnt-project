import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { EntityForm } from "../components/forms/EntityForm";
import { Modal } from "../components/common/Modal";
import { DataTable } from "../components/tables/DataTable";
import { bookingActions } from "../redux/slices/bookingSlice";
import { driverActions } from "../redux/slices/driverSlice";
import { vehicleActions } from "../redux/slices/vehicleSlice";
import { assignTrip, tripActions } from "../redux/slices/tripSlice";

export function TripsPage() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const trips = useSelector((s) => s.trips);
  const bookings = useSelector((s) => s.bookings.items);
  const drivers = useSelector((s) => s.drivers.items);
  const vehicles = useSelector((s) => s.vehicles.items);
  useEffect(() => { dispatch(tripActions.fetchAll()); dispatch(bookingActions.fetchAll()); dispatch(driverActions.fetchAll()); dispatch(vehicleActions.fetchAll()); }, [dispatch]);
  const fields = [
    { name: "bookingId", label: "Booking", type: "select", options: bookings.map((b) => b._id) },
    { name: "driverId", label: "Driver", type: "select", options: drivers.filter((d) => d.status === "Available").map((d) => d._id) },
    { name: "vehicleId", label: "Vehicle", type: "select", options: vehicles.filter((v) => v.status === "Available").map((v) => v._id) }
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Trips</h1><p className="text-sm text-slate-500">Assign, track, complete trips, and generate duty slips.</p></div><button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Assign Trip</button></div>
      <div className="panel p-4"><DataTable loading={trips.loading} rows={trips.items} columns={[{ key: "tripNumber", header: "Trip" }, { key: "booking", header: "Passenger", render: (r) => r.booking?.passengerName }, { key: "driver", header: "Driver", render: (r) => r.driver?.driverName }, { key: "vehicle", header: "Vehicle", render: (r) => r.vehicle?.registrationNumber }, { key: "status", header: "Status" }, { key: "totalKm", header: "KM" }]} /></div>
      <Modal open={open} title="Assign Trip" onClose={() => setOpen(false)}>
        <EntityForm fields={fields} schema={z.object({ bookingId: z.string().min(1), driverId: z.string().min(1), vehicleId: z.string().min(1) })} onSubmit={async (values) => { await dispatch(assignTrip(values)); await dispatch(tripActions.fetchAll()); setOpen(false); }} />
      </Modal>
    </div>
  );
}

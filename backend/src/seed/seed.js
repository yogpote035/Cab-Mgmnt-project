import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Driver } from "../models/Driver.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { Counter } from "../models/Counter.js";

await connectDB();
await Promise.all([User.deleteMany(), Driver.deleteMany(), Vehicle.deleteMany(), Booking.deleteMany(), Counter.deleteMany()]);

await User.create([
  { name: "Super Admin", email: "superadmin@caberp.local", password: "Admin@12345", role: "Super Admin" },
  { name: "Operations Lead", email: "ops@caberp.local", password: "Admin@12345", role: "Operations Admin" },
  { name: "Billing Lead", email: "billing@caberp.local", password: "Admin@12345", role: "Billing Admin" }
]);

await Vehicle.create([
  { registrationNumber: "MH12AB1234", vehicleType: "Sedan", vehicleModel: "Maruti Dzire", cabCategory: "Desire", ratePerKm: 18, status: "Available" },
  { registrationNumber: "MH14CD4567", vehicleType: "SUV", vehicleModel: "Toyota Innova", cabCategory: "Premium", ratePerKm: 28, status: "Available" }
]);

await Driver.create([
  { driverName: "Ramesh Shinde", contactNumber: "9876543210", licenseNumber: "MH122026001", status: "Available" },
  { driverName: "Suresh Patil", contactNumber: "9876501234", licenseNumber: "MH142026002", status: "Available" }
]);

await Booking.create({
  businessUnit: "EMSSI COE",
  passengerName: "Patel, Harsh [EMR/MSOL/PUNE]",
  mobileNumber: "9172333272",
  travelStartDate: new Date("2026-05-22T07:00:00+05:30"),
  travelEndDate: new Date("2026-05-22T18:00:00+05:30"),
  departmentName: "Systems/Project Engineering",
  reportingAddress: "rajmundra colony, ganga nagar, phursungi, Pune",
  carType: "Desire",
  dropAddress: "Talegaon, Emerson facility",
  projectExpenses: "Yes",
  costCenter: "3348019",
  bookedBy: "Patel, Harsh [EMR/MSOL/PUNE]",
  purpose: "Visit to check integration Progress and witness Pre FAT",
  employeeCount: 1,
  cabRequestNumber: "#210526-153355",
  source: "Email",
  status: "New"
});

console.log("Seed completed. Login with superadmin@caberp.local / Admin@12345");
process.exit(0);

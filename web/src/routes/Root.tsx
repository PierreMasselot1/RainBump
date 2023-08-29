import { Outlet } from "react-router-dom";
import Navbar from "../routes/Navbar/Navbar";

export default function Root() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col sm:flex-row bg-neutral-800">
      <Navbar />
      <div className="h-full sm:w-full sm:h-auto bg-neutral-700 sm:rounded-lg sm:mx-2 sm:my-2 p-2">
        <Outlet />
      </div>
    </div>
  );
}

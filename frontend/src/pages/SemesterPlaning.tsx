import { ChartRadarGridCircleFill } from "@/components/radar-chat";
import { Link } from "react-router";



export default function SemesterPlaning() {
  return (
    <div>

      
      <ChartRadarGridCircleFill />
      <Link to={"/completion"}>Completion Page</Link>


    </div>
  );
}

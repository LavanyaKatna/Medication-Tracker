import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AdherenceChart = ({ taken, missed }) => {

    const data = {
        labels: ["Taken", "Missed"],
        datasets: [
            {
                data: [taken, missed],
                backgroundColor: ["#22c55e", "#ef4444"],
                borderWidth: 1
            }
        ]
    };

    return (
        <div style={{ width: "300px", margin: "auto" }}>
            <Pie data={data} />
        </div>
    );
};

export default AdherenceChart;
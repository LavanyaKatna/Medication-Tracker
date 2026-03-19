import { Line } from "react-chartjs-2";

const AdherenceTrendChart = ({ data }) => {
    if (!data || !data.labels) return <div>Loading...</div>;

    return (
        <Line
            data={{
                labels: data.labels,
                datasets: [
                    {
                        label: "Adherence %",
                        data: data.values,
                        borderColor: "#22c55e",
                        tension: 0.3
                    }
                ]
            }}
        />
    );
};

export default AdherenceTrendChart;
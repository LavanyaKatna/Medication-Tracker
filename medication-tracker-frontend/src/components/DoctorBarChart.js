import { Bar } from "react-chartjs-2";

const DoctorBarChart = ({ data }) => {
    if (!data || !data.labels) return <div>Loading...</div>;

    return (
        <Bar
            data={{
                labels: data.labels,
                datasets: [
                    {
                        label: "Prescriptions",
                        data: data.values,
                        backgroundColor: "#3b82f6"
                    }
                ]
            }}
        />
    );
};

export default DoctorBarChart;
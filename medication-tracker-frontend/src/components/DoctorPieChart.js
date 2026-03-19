import { Pie } from "react-chartjs-2";

const DoctorPieChart = ({ data }) => {
    if (!data) return null;

    const backgroundColors = data.labels.map(label => {
        if (label === 'High') return '#22c55e';
        if (label === 'Medium') return '#facc15';
        if (label === 'Low') return '#ef4444';
        return '#94a3b8'; // fallback
    });

    return (
        <Pie
            data={{
                labels: data.labels,
                datasets: [
                    {
                        data: data.values,
                        backgroundColor: backgroundColors
                    }
                ]
            }}
        />
    );
};

export default DoctorPieChart;
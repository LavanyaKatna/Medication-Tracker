import React from "react";
import { useParams } from "react-router-dom";

const ViewPDF = () => {
    const { id } = useParams();
    return (
        <iframe
            src={`http://localhost:8080/api/prescriptions/${id}/pdf`}
            style={{ width: "100%", height: "100vh" }}
            title="Prescription PDF"
        />
    );
};

export default ViewPDF;
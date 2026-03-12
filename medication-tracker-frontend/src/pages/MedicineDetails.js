import React, { useState } from "react";
import api from "../api/api";

const MedicineDetails = () => {

    const [name, setName] = useState("");
    const [info, setInfo] = useState("");

    const fetchInfo = async () => {
        const res = await api.get(`/api/drug-info/${name}`);
        setInfo(JSON.stringify(res.data, null, 2));
    };

    return (

        <div>

            <h2>Drug Information</h2>

            <input
                placeholder="Enter Medicine Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <button onClick={fetchInfo}>Search</button>

            <pre>{info}</pre>

        </div>

    );

};

export default MedicineDetails;
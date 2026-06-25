import React, { useEffect, useState } from "react";
import axios from "axios";

function StateMgt() {
    const [stid, setStid] = useState("");
    const [stname, setStname] = useState("");
    const [status] = useState(1);
    const [stlist, setStlist] = useState([]);

    const handleStIdText = (evt) => {
        setStid(evt.target.value);
    };

    const handleStNameText = (evt) => {
        setStname(evt.target.value);
    };

    const handleSaveButton = () => {
        const obj = {
            stid: Number(stid),
            stname: stname,
            status: status
        };

        axios.post("http://localhost:9191/state/save", obj)
            .then((res) => {
                alert("Data Saved");
            })
            .catch((err) => {
                alert(err);
            });
    };

    useEffect(() => {
        axios.get("http://localhost:9191/state/getall")
            .then((res) => {
                const nextStId = res.data.length + 1;
                setStid(nextStId);
            })
            .catch((err) => {
                alert(err);
            });
    }, []);

    const handleShowButton = () => {
        axios.get("http://localhost:9191/state/getall")
            .then((res) => {
                setStlist(res.data);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleSearchButton = () => {
        axios.get("http://localhost:9191/state/search/" + stid)
            .then((res) => {
                setStname(res.data.stname);
                setStlist([res.data]);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleNewButton = () => {
        axios.get("http://localhost:9191/state/getall")
            .then((res) => {
                const nextStId = res.data.length + 1;
                setStid(nextStId);
                setStname("");
                setStlist([]);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleUpdateButton = () => {
        const obj = {
            stid: Number(stid),
            stname: stname,
            status: 1
        };

        axios.put("http://localhost:9191/state/update", obj)
            .then((res) => {
                alert("Data Updated");
                setStname("");
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleDeleteButton = () => {
        axios.delete("http://localhost:9191/state/delete/" + stid)
            .then((res) => {
                alert("Data Deleted");
                setStname("");
                setStlist([]);
            })
            .catch((err) => {
                alert(err);
            });
    };

    return (
        <div className="container">
            <a href="/admin/login" style={{ display: "inline-block", marginBottom: 12, color: "var(--color-primary)" }}>← Back to Admin</a>
            <h1>State Management</h1>

            <div className="table-container">
                <table className="form-table">
                    <tbody>
                        <tr>
                            <td>State Id</td>
                            <td>
                                <input
                                    type="number"
                                    value={stid}
                                    onChange={handleStIdText}
                                    className="form-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>State Name</td>
                            <td>
                                <input
                                    type="text"
                                    value={stname}
                                    onChange={handleStNameText}
                                    className="form-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="btn-group">
                                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveButton}>Save</button>
                                <button type="button" className="btn btn-info btn-sm" onClick={handleShowButton}>Show</button>
                                <button type="button" className="btn btn-warning btn-sm" onClick={handleSearchButton}>Search</button>
                                <button type="button" className="btn btn-success btn-sm" onClick={handleUpdateButton}>Update</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleNewButton}>New</button>
                                <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteButton}>Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>State Id</th>
                            <th>State Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stlist.map((item, index) => (
                            <tr key={index}>
                                <td>{item.stid}</td>
                                <td>{item.stname}</td>
                                <td><span className={`status-badge ${item.status === 1 ? 'enabled' : 'disabled'}`}>{item.status === 1 ? 'Active' : 'Inactive'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StateMgt;
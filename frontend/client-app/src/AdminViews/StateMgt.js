import React, { useEffect, useState } from "react";
import axios from "axios";

function CityMgt() {
    const [ctid, setCtid] = useState("");
    const [ctname, setCtname] = useState("");
    const [stid, setStid] = useState("");
    const [status] = useState(1);

    const [ctlist, setCtlist] = useState([]);
    const [stlist, setStlist] = useState([]);

    const handleCtIdText = (evt) => {
        setCtid(evt.target.value);
    };

    const handleCtNameText = (evt) => {
        setCtname(evt.target.value);
    };

    useEffect(() => {
        axios
            .get("http://localhost:9191/state/getall")
            .then((res) => {
                setStlist(res.data);
            })
            .catch((err) => {
                alert(err);
            });

        axios
            .get("http://localhost:9191/city/getall")
            .then((res) => {
                const nextCtId = res.data.length + 1;
                setCtid(nextCtId);
            })
            .catch((err) => {
                alert(err);
            });
    }, []);

    const handleSaveButton = () => {
        const obj = {
            ctid: Number(ctid),
            ctname: ctname,
            stid: Number(stid),
            status: status,
        };

        axios
            .post("http://localhost:9191/city/save", obj)
            .then((res) => {
                alert("City Saved");
                handleShowButton();
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleShowButton = () => {
        axios
            .get("http://localhost:9191/city/getall")
            .then((res) => {
                setCtlist(res.data);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleSearchButton = () => {
        axios
            .get("http://localhost:9191/city/search/" + ctid)
            .then((res) => {
                setCtname(res.data.ctname);
                setStid(res.data.stid);
                setCtlist([res.data]);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleNewButton = () => {
        axios
            .get("http://localhost:9191/city/getall")
            .then((res) => {
                const nextCtId = res.data.length + 1;
                setCtid(nextCtId);
                setCtname("");
                setStid("");
                setCtlist([]);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleUpdateButton = () => {
        const obj = {
            ctid: Number(ctid),
            ctname: ctname,
            stid: Number(stid),
            status: 1,
        };

        axios
            .put("http://localhost:9191/city/update", obj)
            .then((res) => {
                alert("City Updated");
                handleShowButton();
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleDeleteButton = () => {
        axios
            .delete("http://localhost:9191/city/delete/" + ctid)
            .then((res) => {
                alert("City Deleted");
                setCtname("");
                setStid("");
                setCtlist([]);
            })
            .catch((err) => {
                alert(err);
            });
    };

    return (
        <div className="container">
            <a href="/admin/login" style={{ display: "inline-block", marginBottom: 12, color: "var(--color-primary)" }}>← Back to Admin</a>
            <h1>City Management</h1>

            <div className="table-container">
                <table className="form-table">
                    <tbody>
                        <tr>
                            <td>City Id</td>
                            <td>
                                <input
                                    type="number"
                                    value={ctid}
                                    onChange={handleCtIdText}
                                    className="form-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>City Name</td>
                            <td>
                                <input
                                    type="text"
                                    value={ctname}
                                    onChange={handleCtNameText}
                                    className="form-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Select State</td>
                            <td>
                                <select
                                    value={stid}
                                    onChange={(e) =>
                                        setStid(e.target.value)
                                    }
                                    className="form-select"
                                >
                                    <option value="">
                                        Select State
                                    </option>
                                    {stlist.map((item) => (
                                        <option
                                            key={item.stid}
                                            value={item.stid}
                                        >
                                            {item.stname}
                                        </option>
                                    ))}
                                </select>
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
                            <th>City Id</th>
                            <th>City Name</th>
                            <th>State Id</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ctlist.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ctid}</td>
                                <td>{item.ctname}</td>
                                <td>{item.stid}</td>
                                <td><span className={`status-badge ${item.status === 1 ? 'enabled' : 'disabled'}`}>{item.status === 1 ? 'Active' : 'Inactive'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CityMgt;
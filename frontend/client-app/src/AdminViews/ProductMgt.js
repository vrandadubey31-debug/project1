import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductMgt() {
    const [pcatgid, setPcatgid] = useState("");
    const [pcatgname, setPcatgname] = useState("");
    const [plist, setPlist] = useState([]);

    const getNextId = () => {
        axios.get("http://localhost:9191/productcatg/showproductcatg")
            .then((res) => {
                const data = res.data;

                if (data.length > 0) {
                    const maxId = Math.max(
                        ...data.map(item => Number(item.pcatgid))
                    );
                    setPcatgid(maxId + 1);
                } else {
                    setPcatgid(1);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        getNextId();
    }, []);

    const handlePcatgIdText = (evt) => {
        setPcatgid(evt.target.value);
    };

    const handlePcatgNameText = (evt) => {
        setPcatgname(evt.target.value);
    };

    const handleSaveButton = () => {
        axios.post(
            "http://localhost:9191/productcatg/addproductcatg/" +
            pcatgid +
            "/" +
            pcatgname
        )
        .then((res) => {
            alert("Product Category Saved Successfully");
            setPcatgname("");
            getNextId();
        })
        .catch((err) => {
            alert(err);
        });
    };

    const handleShowButton = () => {
        axios.get("http://localhost:9191/productcatg/showproductcatg")
            .then((res) => {
                setPlist(res.data);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleSearchButton = () => {
        axios.get("http://localhost:9191/productcatg/showproductcatg")
            .then((res) => {
                const data = res.data.filter(
                    item => Number(item.pcatgid) === Number(pcatgid)
                );

                if (data.length > 0) {
                    setPcatgname(data[0].pcatgname);
                    setPlist(data);
                } else {
                    alert("Record Not Found");
                }
            })
            .catch((err) => {
                alert(err);
            });
    };

    const handleUpdateButton = () => {
        axios.put(
            "http://localhost:9191/productcatg/updateproductcatg/" +
            pcatgid +
            "/" +
            pcatgname
        )
        .then((res) => {
            alert(res.data);
        })
        .catch((err) => {
            alert(err);
        });
    };

    const handleDeleteButton = () => {
        axios.put(
            "http://localhost:9191/productcatg/deleteproductcatg/" +
            pcatgid
        )
        .then((res) => {
            alert(res.data);
            setPcatgname("");
            setPlist([]);
            getNextId();
        })
        .catch((err) => {
            alert(err);
        });
    };

    const handleNewButton = () => {
        setPcatgname("");
        setPlist([]);
        getNextId();
    };

    return (
        <div className="container">
            <a href="/admin/login" style={{ display: "inline-block", marginBottom: 12, color: "var(--color-primary)" }}>← Back to Admin</a>
            <h1>Product Category Management</h1>

            <div className="table-container">
                <table className="form-table">
                    <tbody>
                        <tr>
                            <td>Product Category ID</td>
                            <td>
                                <input
                                    type="number"
                                    value={pcatgid}
                                    onChange={handlePcatgIdText}
                                    className="form-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Product Category Name</td>
                            <td>
                                <input
                                    type="text"
                                    value={pcatgname}
                                    onChange={handlePcatgNameText}
                                    className="form-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="btn-group">
                                <button className="btn btn-primary btn-sm" onClick={handleSaveButton}>Save</button>
                                <button className="btn btn-info btn-sm" onClick={handleShowButton}>Show</button>
                                <button className="btn btn-warning btn-sm" onClick={handleSearchButton}>Search</button>
                                <button className="btn btn-success btn-sm" onClick={handleUpdateButton}>Update</button>
                                <button className="btn btn-secondary btn-sm" onClick={handleNewButton}>New</button>
                                <button className="btn btn-danger btn-sm" onClick={handleDeleteButton}>Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Category ID</th>
                            <th>Category Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plist.map((item, index) => (
                            <tr key={index}>
                                <td>{item.pcatgid}</td>
                                <td>{item.pcatgname}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductMgt;
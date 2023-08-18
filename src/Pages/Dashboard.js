import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchData()
      .then((result) => setData(result))
      .catch((error) => console.log(error));
  }, []);

  const fetchData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockData());
      }, 1000);
    });
  };

  const getMockData = () => {
    return [
      {
        id: 1000,
        name: "James Butt",
        country: "United States",
        status: "unqualified",
        verified: true,
      },
      {
        id: 1001,
        name: "Josephine Darakjy",
        country: "Egypt",
        status: "qualified",
        verified: true,
      },
      {
        id: 1002,
        name: "Art Venere",
        country: "Netherlands",
        status: "new",
        verified: false,
      },
      // Add more data here...
    ];
  };

  const handleCheckboxChange = (rowData) => {
    if (selectedRows.includes(rowData.id)) {
      setSelectedRows((prevSelected) =>
        prevSelected.filter((id) => id !== rowData.id)
      );
    } else {
      setSelectedRows((prevSelected) => [...prevSelected, rowData.id]);
    }
  };

  const handleSubmit = () => {
    const selectedData = data.filter((row) => selectedRows.includes(row.id));
    console.log("Selected Data:", selectedData);
  };

  return (
    <div className="card">
      <Button label="Submit" onClick={handleSubmit} />
      <DataTable
        value={data}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        selectionMode="checkbox"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
          bodyStyle={{ textAlign: "center" }}
          body={(rowData) => (
            <InputSwitch
              checked={selectedRows.includes(rowData.id)}
              onChange={(e) => handleCheckboxChange(rowData)}
            />
          )}
        ></Column>
        <Column
          field="name"
          header="Name"
          filter
          filterPlaceholder="Search by name"
        />
        <Column
          field="country"
          header="Country"
          filter
          filterPlaceholder="Search by country"
        />
        <Column
          field="status"
          header="Status"
          filter
          filterPlaceholder="Search by status"
        />
        <Column
          field="verified"
          header="Verified"
          filter
          filterPlaceholder="Search by verified"
        />
      </DataTable>
    </div>
  );
};

export default Dashboard;

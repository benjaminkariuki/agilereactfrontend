import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";


const DetailsMoreDialog = ({ showDetailsMore, disableShowDelegateDialog }) => {
  const [projectData, setProjectData] = useState([]);

  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const transformData = (data) => {
    let result = [];
    
    for (let key in data.archivedProjectPhasesCount) {
        let item = data.archivedProjectPhasesCount[key];
        
        result.push({
            project_title: item.project_title,
            phase_name: item.phase_name,
            phase_activity_name: item.phase_activity_name,
            subtask_count: item.subtask_count
        });
    }

    return result;
}

  // toast display functions
  const onSuccessRequest = (success) => {
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Successfully",
        detail: `${success}`,
        life: 1000,
      });
    }
  };

  const onError = (error) => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error occurred",
        detail: `${error}`,
        life: 1000,
      });
    }
  };

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

  useEffect(() => {
    if (showDetailsMore) {
      setIsLoading(true);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
      axios
        .get(
          `https://agile-pm.agilebiz.co.ke/api/allProjectPhasesPhaseActivityActive`,config
        )
        .then((response) => {
          // Handle the response data
          
          const projectinfo = transformData(response.data);
          setProjectData(projectinfo);
          setIsLoading(false);
          console.log(projectData);
        })
        .catch((error) => {
          // Handle any errors here
          console.error(
            "Error fetching project,phases in active sprint:",
            error
          );
          setIsLoading(false);
        });
    }
  }, [showDetailsMore]);

  return (
    <div>
      {/* <Toast ref={toast} /> */}
      <Dialog
        header={"Active Sprint Project Details"}
        visible={showDetailsMore}
        onHide={disableShowDelegateDialog}
        style={{ width: "98vw", height: "98vh" }}
        className="overflow-auto" // Makes the content of the dialog scrollable
      >
        {!isLoading ? (
          <div className="bg-white p-4 rounded-lg h-full flex flex-col justify-between">
            {/* This is the content of the dialog, which will only be rendered when projectData is not empty */}
            <div>
              <DataTable
                value={projectData}
                className="border rounded-md p-4 bg-white"
                dataKey="id"
              >
                <Column
                  headerStyle={{ width: "3rem" }}
                ></Column>
                <Column
                  field="project_title"
                  header="Project Title"
                  body={sentenceCaseFormatter}
                ></Column>
                <Column
                  field="phase_name"
                  header="Phase"
                  body={sentenceCaseFormatter}
                ></Column>
                <Column
                  field="phase_activity_name"
                  header="Phase Activity "
                  body={sentenceCaseFormatter}
                ></Column>
                <Column
                  field="subtask_count"
                  header="Number of Tasks"
                  body={sentenceCaseFormatter}
                ></Column>   
              </DataTable>
            </div>
          </div>
        ) : (
          <div>
            <i
              className="pi pi-spin pi-spinner"
              style={{ fontSize: "1.4rem" }}
            ></i>
          </div> // This will be rendered when projectData is empty
        )}
      </Dialog>
    </div>
  );
};

export default DetailsMoreDialog;

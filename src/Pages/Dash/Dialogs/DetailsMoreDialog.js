import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { useNavigate } from "react-router-dom";



const DetailsMoreDialog = ({ showDetailsMore, disableShowDelegateDialog }) => {
  const [projectData, setProjectData] = useState([]);

  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


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

 

 

  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };

  useEffect(() => {
    fetchName();
    if (showDetailsMore) {
      setIsLoading(true);
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
      axios
        .get(
          `https://agilepmtest.agilebiz.co.ke/api/allProjectPhasesPhaseActivityActive`,config
        )
        .then((response) => {
          // Handle the response data
          if (response.status === 401) {
            navigate('/');
          }
          
          const projectinfo = transformData(response.data);
          setProjectData(projectinfo);
          setIsLoading(false);
        })
        .catch((error) => {
          // Handle any errors here
          
          setIsLoading(false);
        });
    }
  }, [showDetailsMore]);

  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly
  
      const response = await fetch(
        "https://agilepmtest.agilebiz.co.ke/api/appName",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 401) {
        navigate('/');
      }
  
      // Rest of your code...
    } catch (error) {
      // Error handling code...
    }
  };

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
                  sortable
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

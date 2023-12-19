import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import _ from "lodash";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../apiConfig";




const DetailsArchivedDialog = ({showDetailsArchived, disableShowDelegateDialogArchived }) => {
  const [projectData, setProjectData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const sentenceCaseFormatter = (rowData, column) => {
    return _.startCase(rowData[column.field]);
  };


 



  useEffect(() => {
   fetchName();
    if (showDetailsArchived) {
      setIsLoading(true);

      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

      axios
        .get(
          `${API_BASE_URL}/allProject_Support_Archived?page=${page + 1}`,config
        )
        .then((response) => {
          // Handle the response data
          if (response.status === 401) {
            navigate('/');
          }
          
          const projectinfo = (response.data.projectTitles.data);
          setTotalRecords(response.data.projectTitles.total);

          setProjectData(projectinfo);
          setIsLoading(false);
        })
        .catch((error) => {
          // Handle any errors here
          setIsLoading(false);
          
        });
    }
  }, [showDetailsArchived,page]);

  const fetchName = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Ensure token is retrieved correctly
  
      const response = await fetch(
        `${API_BASE_URL}/appName`,
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

  const renderFooter = () => {
    return (
      <div>
        {projectData.length > 0 && (
          <Paginator
            first={page * 10}
            rows={10}
            totalRecords={totalRecords}
            onPageChange={(e) => {
              setPage(e.page);
            }}

            template={{
              layout: "PrevPageLink CurrentPageReport NextPageLink",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* <Toast ref={toast} /> */}
      <Dialog
        header={"Projects: Archived"}
        visible={showDetailsArchived}
        onHide={disableShowDelegateDialogArchived}
        style={{ width: "98vw", height: "98vh" }}
        footer={renderFooter()} // Use the footer prop
      >
        {!isLoading ? (
          <div className="bg-white p-4 rounded-lg h-full flex flex-col justify-between">
            {/* This is the content of the dialog, which will only be rendered when projectData is not empty */}
            <div style={{ maxHeight: "85vh", overflow: "auto" }}> 
              <DataTable
                value={projectData}
                className="border rounded-md p-4 bg-white"
                dataKey="id"
              >
                <Column
                  headerStyle={{ width: "3rem" }}
                ></Column>
                <Column
                  field="title"
                  header="Project Title"
                  body={sentenceCaseFormatter}
                ></Column>
                <Column
                  field="start_date"
                  header="Start Date"
                 
                ></Column>
                <Column
                  field="end_date"
                  header="End Date"
                ></Column>
                  
                 <Column
                  field="clientname"
                  header="Client"
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

export default DetailsArchivedDialog;
